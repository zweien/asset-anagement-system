import { Request, Response } from 'express'
import { ImportService, FieldMapping } from '../services/import.service'
import { FieldService } from '../services/field.service'
import { LogService } from '../services/log.service'

export const ImportController = {
  // 上传并解析 Excel
  async parse(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: '请上传文件' })
      }

      const buffer = req.file.buffer
      const { headers, rows } = ImportService.parseExcel(buffer)

      res.json({
        success: true,
        data: {
          headers,
          preview: rows.slice(0, 10), // 预览前 10 行
          total: rows.length,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '解析文件失败',
      })
    }
  },

  // 执行导入
  async import(req: Request, res: Response) {
    try {
      const { rows, mapping } = req.body as {
        rows: Record<string, any>[]
        mapping: FieldMapping[]
      }

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, error: '没有数据需要导入' })
      }

      if (!mapping || !Array.isArray(mapping)) {
        return res.status(400).json({ success: false, error: '请配置字段映射' })
      }

      // 获取字段配置
      const fields = await FieldService.getAll()

      const result = await ImportService.importAssets(rows, mapping, fields)

      // 记录导入日志
      if (result.imported > 0) {
        await LogService.create({
          action: 'IMPORT',
          entityType: 'Asset',
          newValue: {
            total: rows.length,
            imported: result.imported,
            skipped: result.skipped,
            errors: result.errors,
          },
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        })
      }

      res.json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导入失败',
      })
    }
  },
}
