import { Request, Response } from 'express'
import { ExportService } from '../services/export.service'
import { LogService } from '../services/log.service'

export const ExportController = {
  // 导出为 Excel
  async exportExcel(req: Request, res: Response) {
    try {
      const { fields, status, search } = req.body as {
        fields: string[]
        status?: string
        search?: string
      }

      if (!fields || !Array.isArray(fields)) {
        return res.status(400).json({ success: false, error: '请选择要导出的字段' })
      }

      const buffer = await ExportService.exportToExcel({
        fields,
        status,
        search,
      })

      // 记录导出日志
      await LogService.create({
        action: 'EXPORT',
        entityType: 'Asset',
        newValue: { format: 'excel', fields, status, search },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      const filename = `资产数据_${new Date().toISOString().split('T')[0]}.xlsx`

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
      res.send(buffer)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      })
    }
  },

  // 导出为 CSV
  async exportCSV(req: Request, res: Response) {
    try {
      const { fields, status, search } = req.body as {
        fields: string[]
        status?: string
        search?: string
      }

      if (!fields || !Array.isArray(fields)) {
        return res.status(400).json({ success: false, error: '请选择要导出的字段' })
      }

      const csv = await ExportService.exportToCSV({
        fields,
        status,
        search,
      })

      // 记录导出日志
      await LogService.create({
        action: 'EXPORT',
        entityType: 'Asset',
        newValue: { format: 'csv', fields, status, search },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      const filename = `资产数据_${new Date().toISOString().split('T')[0]}.csv`

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
      // 添加 BOM 以支持 Excel 正确显示中文
      res.send('\ufeff' + csv)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      })
    }
  },
}
