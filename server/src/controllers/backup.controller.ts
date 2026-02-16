import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import logger from '../utils/logger'

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'data', 'assets.db')

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

export const BackupController = {
  /**
   * 创建备份
   */
  async createBackup(req: Request, res: Response) {
    try {
      // 检查数据库文件是否存在
      if (!fs.existsSync(DB_PATH)) {
        return res.status(404).json({
          success: false,
          error: '数据库文件不存在',
        })
      }

      // 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `backup-${timestamp}.db`
      const backupPath = path.join(BACKUP_DIR, filename)

      // 复制数据库文件
      fs.copyFileSync(DB_PATH, backupPath)

      // 获取文件信息
      const stats = fs.statSync(backupPath)

      logger.info(`Backup created: ${filename}`, { size: stats.size })

      return res.json({
        success: true,
        data: {
          filename,
          size: stats.size,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      logger.error('Failed to create backup', { error: (error as Error).message })
      return res.status(500).json({
        success: false,
        error: '创建备份失败',
      })
    }
  },

  /**
   * 获取备份列表
   */
  async getBackupList(req: Request, res: Response) {
    try {
      const files = fs.readdirSync(BACKUP_DIR)
      const backups = files
        .filter((f) => f.endsWith('.db'))
        .map((filename) => {
          const filePath = path.join(BACKUP_DIR, filename)
          const stats = fs.statSync(filePath)
          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          }
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return res.json({
        success: true,
        data: backups,
      })
    } catch (error) {
      logger.error('Failed to get backup list', { error: (error as Error).message })
      return res.status(500).json({
        success: false,
        error: '获取备份列表失败',
      })
    }
  },

  /**
   * 下载备份
   */
  async downloadBackup(req: Request, res: Response) {
    try {
      const { filename } = req.params
      const backupPath = path.join(BACKUP_DIR, filename)

      // 安全检查：防止路径遍历
      if (!filename.endsWith('.db') || filename.includes('..')) {
        return res.status(400).json({
          success: false,
          error: '无效的文件名',
        })
      }

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({
          success: false,
          error: '备份文件不存在',
        })
      }

      logger.info(`Backup downloaded: ${filename}`)

      return res.download(backupPath, filename)
    } catch (error) {
      logger.error('Failed to download backup', { error: (error as Error).message })
      return res.status(500).json({
        success: false,
        error: '下载备份失败',
      })
    }
  },

  /**
   * 恢复备份
   */
  async restoreBackup(req: Request, res: Response) {
    try {
      const { filename } = req.params
      const backupPath = path.join(BACKUP_DIR, filename)

      // 安全检查
      if (!filename.endsWith('.db') || filename.includes('..')) {
        return res.status(400).json({
          success: false,
          error: '无效的文件名',
        })
      }

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({
          success: false,
          error: '备份文件不存在',
        })
      }

      // 在恢复前创建当前数据库的备份
      if (fs.existsSync(DB_PATH)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const preRestoreBackup = path.join(BACKUP_DIR, `pre-restore-${timestamp}.db`)
        fs.copyFileSync(DB_PATH, preRestoreBackup)
        logger.info(`Pre-restore backup created: pre-restore-${timestamp}.db`)
      }

      // 恢复数据库
      fs.copyFileSync(backupPath, DB_PATH)

      logger.info(`Database restored from: ${filename}`)

      return res.json({
        success: true,
        message: '数据库恢复成功，请重启服务器',
      })
    } catch (error) {
      logger.error('Failed to restore backup', { error: (error as Error).message })
      return res.status(500).json({
        success: false,
        error: '恢复备份失败',
      })
    }
  },

  /**
   * 删除备份
   */
  async deleteBackup(req: Request, res: Response) {
    try {
      const { filename } = req.params
      const backupPath = path.join(BACKUP_DIR, filename)

      // 安全检查
      if (!filename.endsWith('.db') || filename.includes('..')) {
        return res.status(400).json({
          success: false,
          error: '无效的文件名',
        })
      }

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({
          success: false,
          error: '备份文件不存在',
        })
      }

      fs.unlinkSync(backupPath)

      logger.info(`Backup deleted: ${filename}`)

      return res.json({
        success: true,
        message: '备份删除成功',
      })
    } catch (error) {
      logger.error('Failed to delete backup', { error: (error as Error).message })
      return res.status(500).json({
        success: false,
        error: '删除备份失败',
      })
    }
  },
}
