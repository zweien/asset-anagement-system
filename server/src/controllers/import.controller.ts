import { Request, Response } from 'express'
import { ImportService, FieldMapping } from '../services/import.service'
import { FieldService } from '../services/field.service'
import { LogService } from '../services/log.service'
import * as XLSX from 'xlsx'

export const ImportController = {
  // 下载导入模板
  async downloadTemplate(req: Request, res: Response) {
    try {
      // 获取字段配置
      const fields = await FieldService.getAll()

      // 基础列
      const headers = ['资产名称*', '资产编号', '状态']

      // 添加动态字段列
      const fieldColumns: string[] = []
      fields.forEach(field => {
        if (field.type === 'SELECT' || field.type === 'MULTISELECT') {
          const options = field.options ? JSON.parse(field.options) : []
          fieldColumns.push(`${field.label}(${options.join('/')})`)
        } else if (field.type === 'DATE') {
          fieldColumns.push(`${field.label}(日期)`)
        } else if (field.type === 'NUMBER') {
          fieldColumns.push(`${field.label}(数字)`)
        } else {
          fieldColumns.push(field.label)
        }
      })

      const allHeaders = [...headers, ...fieldColumns]

      // 示例数据行
      const exampleRow: string[] = [
        '示例电脑',
        'IT-001',
        '在用',
        ...fields.map(field => {
          if (field.type === 'SELECT' || field.type === 'MULTISELECT') {
            const options = field.options ? JSON.parse(field.options) : []
            return options[0] || ''
          } else if (field.type === 'DATE') {
            return '2024-01-15'
          } else if (field.type === 'NUMBER') {
            return '100'
          }
          return '示例值'
        })
      ]

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([allHeaders, exampleRow])

      // 设置列宽
      ws['!cols'] = allHeaders.map(() => ({ wch: 15 }))

      XLSX.utils.book_append_sheet(wb, ws, '资产导入模板')

      // 生成 Excel 文件
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=asset_import_template.xlsx')
      res.send(buffer)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '生成模板失败',
      })
    }
  },

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
