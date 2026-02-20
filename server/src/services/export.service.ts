import * as xlsx from 'xlsx'
import { prisma } from '../lib/database'

export interface ExportOptions {
  fields: string[] // 要导出的字段 ID
  status?: string // 状态筛选
  search?: string // 搜索条件
}

export const ExportService = {
  // 导出为 Excel
  async exportToExcel(options: ExportOptions): Promise<Buffer> {
    const { fields, status, search } = options

    // 构建查询条件
    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    // 查询数据
    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 获取字段配置
    const fieldConfigs = await prisma.fieldConfig.findMany({
      where: { id: { in: fields } },
      orderBy: { order: 'asc' },
    })

    // 构建数据行
    const rows: Record<string, any>[] = []

    for (const asset of assets) {
      const row: Record<string, any> = {
        '资产编号': asset.code || '',
        '资产名称': asset.name,
        '分类': asset.category?.name || '',
        '状态': asset.status,
        '创建时间': asset.createdAt.toISOString().split('T')[0],
      }

      // 添加动态字段
      if (asset.data) {
        try {
          const data = JSON.parse(asset.data)
          for (const field of fieldConfigs) {
            row[field.label] = data[field.name] || ''
          }
        } catch {
          // 忽略解析错误
        }
      }

      rows.push(row)
    }

    // 创建工作簿
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(rows)

    // 设置列宽
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet['!cols'] = colWidths

    xlsx.utils.book_append_sheet(workbook, worksheet, '资产数据')

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  },

  // 导出为 CSV
  async exportToCSV(options: ExportOptions): Promise<string> {
    const { fields, status, search } = options

    // 构建查询条件
    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    // 查询数据
    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 获取字段配置
    const fieldConfigs = await prisma.fieldConfig.findMany({
      where: { id: { in: fields } },
      orderBy: { order: 'asc' },
    })

    // 构建表头
    const headers = ['资产编号', '资产名称', '分类', '状态', '创建时间']
    fieldConfigs.forEach((f) => headers.push(f.label))

    // 构建数据行
    const rows: string[][] = [headers]

    for (const asset of assets) {
      const row = [
        asset.code || '',
        asset.name,
        asset.category?.name || '',
        asset.status,
        asset.createdAt.toISOString().split('T')[0],
      ]

      // 添加动态字段
      if (asset.data) {
        try {
          const data = JSON.parse(asset.data)
          for (const field of fieldConfigs) {
            row.push(String(data[field.name] || ''))
          }
        } catch {
          fieldConfigs.forEach(() => row.push(''))
        }
      } else {
        fieldConfigs.forEach(() => row.push(''))
      }

      rows.push(row)
    }

    // 转换为 CSV 字符串
    return rows
      .map((row) =>
        row.map((cell) => {
          // 处理包含逗号或引号的单元格
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        }).join(',')
      )
      .join('\n')
  },
}
