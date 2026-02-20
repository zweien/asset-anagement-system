import * as xlsx from 'xlsx'
import { AssetService } from './asset.service'

export interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: { row: number; message: string }[]
}

export interface FieldMapping {
  excelColumn: string
  fieldId: string
  fieldName: string
}

export const ImportService = {
  // 解析 Excel 文件
  parseExcel(buffer: Buffer): { headers: string[]; rows: Record<string, any>[] } {
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1 })

    if (data.length === 0) {
      return { headers: [], rows: [] }
    }

    const headers = data[0] as string[]
    const rows = data.slice(1).map((row) => {
      const obj: Record<string, any> = {}
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = (row as any[])[index]
        }
      })
      return obj
    })

    return { headers, rows }
  },

  // 导入数据
  async importAssets(
    rows: Record<string, any>[],
    mapping: FieldMapping[],
    fieldConfigs: { id: string; name: string; type: string; required: boolean }[]
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
    }

    // 创建字段 ID 到配置的映射
    const fieldConfigMap = new Map(fieldConfigs.map((f) => [f.id, f]))

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Excel 行号从 2 开始（第 1 行是标题）

      try {
        // 提取基础字段
        const nameMapping = mapping.find((m) => m.fieldName === 'name')
        const codeMapping = mapping.find((m) => m.fieldName === 'code')

        const name = nameMapping ? row[nameMapping.excelColumn] : null
        if (!name) {
          result.errors.push({ row: rowNum, message: '资产名称不能为空' })
          result.skipped++
          continue
        }

        const code = codeMapping ? row[codeMapping.excelColumn] : null

        // 提取动态字段数据
        const data: Record<string, any> = {}
        for (const map of mapping) {
          if (map.fieldName === 'name' || map.fieldName === 'code') continue

          const config = fieldConfigMap.get(map.fieldId)
          if (!config) continue

          let value = row[map.excelColumn]

          // 类型转换
          if (config.type === 'NUMBER' && value !== undefined) {
            value = Number(value)
            if (isNaN(value)) value = null
          } else if (config.type === 'DATE' && value !== undefined) {
            // Excel 日期可能是数字或字符串
            if (typeof value === 'number') {
              const date = xlsx.SSF.parse_date_code(value)
              if (date) {
                value = new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0]
              }
            } else if (value instanceof Date) {
              value = value.toISOString().split('T')[0]
            }
          } else if ((config.type === 'SELECT' || config.type === 'MULTISELECT') && value !== undefined) {
            value = String(value)
          }

          if (value !== undefined && value !== null && value !== '') {
            data[config.name] = value
          }
        }

        // 创建资产
        const createResult = await AssetService.create({
          name: String(name),
          code: code ? String(code) : undefined,
          status: 'IDLE',
          data,
        })

        if (createResult.success) {
          result.imported++
        } else {
          result.errors.push({ row: rowNum, message: (createResult as any).error || '创建失败' })
          result.skipped++
        }
      } catch (err) {
        result.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : '未知错误',
        })
        result.skipped++
      }
    }

    result.success = result.imported > 0
    return result
  },
}
