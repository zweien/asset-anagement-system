import { Request, Response } from 'express'
import { DBImportService, DBConnectionConfig, FieldMapping } from '../services/db-import.service'

export const DBImportController = {
  // 测试数据库连接
  async testConnection(req: Request, res: Response) {
    try {
      const config = req.body as DBConnectionConfig

      // 基本验证
      if (!config.type || !config.host || !config.database || !config.username) {
        return res.status(400).json({
          success: false,
          error: '请填写完整的连接信息',
        })
      }

      const result = await DBImportService.testConnection(config)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '连接测试失败',
      })
    }
  },

  // 获取数据库表列表
  async getTables(req: Request, res: Response) {
    try {
      const config = req.body as DBConnectionConfig

      const result = await DBImportService.getTables(config)

      if (!result.success) {
        return res.status(400).json(result)
      }

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取表列表失败',
      })
    }
  },

  // 预览表数据
  async previewData(req: Request, res: Response) {
    try {
      const { config, tableName } = req.body as {
        config: DBConnectionConfig
        tableName: string
      }

      if (!tableName) {
        return res.status(400).json({
          success: false,
          error: '请选择要预览的表',
        })
      }

      const result = await DBImportService.previewData(config, tableName)

      if (!result.success) {
        return res.status(400).json(result)
      }

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '预览数据失败',
      })
    }
  },

  // 执行导入
  async importData(req: Request, res: Response) {
    try {
      const { config, tableName, mapping } = req.body as {
        config: DBConnectionConfig
        tableName: string
        mapping: FieldMapping[]
      }

      if (!tableName) {
        return res.status(400).json({
          success: false,
          error: '请选择要导入的表',
        })
      }

      if (!mapping || mapping.length === 0) {
        return res.status(400).json({
          success: false,
          error: '请配置字段映射',
        })
      }

      const result = await DBImportService.importData(config, tableName, mapping)

      if (!result.success) {
        return res.status(400).json(result)
      }

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导入失败',
      })
    }
  },
}
