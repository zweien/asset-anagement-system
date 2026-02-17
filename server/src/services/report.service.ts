import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateReportTemplateDto {
  name: string
  description?: string
  chartType: 'bar' | 'pie' | 'line'
  dimension: string
  filters?: string
  dateRange?: string
  customStartDate?: string
  customEndDate?: string
  isDefault?: boolean
}

export interface UpdateReportTemplateDto {
  name?: string
  description?: string
  chartType?: 'bar' | 'pie' | 'line'
  dimension?: string
  filters?: string
  dateRange?: string
  customStartDate?: string
  customEndDate?: string
  isDefault?: boolean
}

export const ReportService = {
  // 获取所有报表模板
  async getAllTemplates() {
    return prisma.reportTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  },

  // 获取单个报表模板
  async getTemplateById(id: string) {
    return prisma.reportTemplate.findUnique({
      where: { id },
    })
  },

  // 创建报表模板
  async createTemplate(data: CreateReportTemplateDto) {
    // 如果设为默认，先取消其他默认
    if (data.isDefault) {
      await prisma.reportTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    return prisma.reportTemplate.create({
      data,
    })
  },

  // 更新报表模板
  async updateTemplate(id: string, data: UpdateReportTemplateDto) {
    // 如果设为默认，先取消其他默认
    if (data.isDefault) {
      await prisma.reportTemplate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    return prisma.reportTemplate.update({
      where: { id },
      data,
    })
  },

  // 删除报表模板
  async deleteTemplate(id: string) {
    return prisma.reportTemplate.delete({
      where: { id },
    })
  },

  // 获取报表数据
  async getReportData(
    dimension: string,
    chartType: string,
    filters?: string,
    dateRange?: string,
    customStartDate?: string,
    customEndDate?: string
  ) {
    // 构建日期筛选条件
    let dateFilter: any = {}
    const now = new Date()

    switch (dateRange) {
      case 'today':
        dateFilter = {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        }
        break
      case 'week': {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        dateFilter = { gte: weekStart }
        break
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = { gte: monthStart }
        break
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = { gte: yearStart }
        break
      }
      case 'custom':
        if (customStartDate) {
          dateFilter.gte = new Date(customStartDate)
        }
        if (customEndDate) {
          dateFilter.lte = new Date(customEndDate)
        }
        break
    }

    // 构建基础查询条件
    const where: any = { deletedAt: null }

    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter
    }

    // 解析额外筛选条件
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters)
        // 处理分类筛选
        if (parsedFilters.categoryId) {
          where.categoryId = parsedFilters.categoryId
        }
        if (parsedFilters.status) {
          where.status = parsedFilters.status
        }
      } catch (e) {
        // 忽略无效的 JSON
      }
    }

    // 获取资产数据
    const assets = await prisma.asset.findMany({
      where,
      include: { category: true },
    })

    // 根据维度分组统计
    const groups: Record<string, { label: string; count: number; value: number }> = {}

    for (const asset of assets) {
      let key: string
      let label: string

      switch (dimension) {
        case 'status': {
          const statusLabels: Record<string, string> = {
            ACTIVE: '在用',
            IDLE: '闲置',
            MAINTENANCE: '维修',
            SCRAPPED: '报废',
          }
          key = asset.status
          label = statusLabels[asset.status] || asset.status
          break
        }

        case 'categoryId':
          key = asset.categoryId || 'uncategorized'
          label = asset.category?.name || '未分类'
          break

        case 'createdAt': {
          // 按月份分组
          const month = asset.createdAt.toISOString().slice(0, 7)
          key = month
          label = month
          break
        }

        default:
          // 动态字段
          try {
            const data = JSON.parse(asset.data)
            const value = data[dimension]
            if (value !== undefined && value !== null && value !== '') {
              key = String(value)
              label = String(value)
            } else {
              key = 'unknown'
              label = '未知'
            }
          } catch {
            key = 'unknown'
            label = '未知'
          }
      }

      if (!groups[key]) {
        groups[key] = { label, count: 0, value: 0 }
      }
      groups[key].count++
      groups[key].value++
    }

    // 转换为数组并排序
    const result = Object.values(groups).sort((a, b) => b.value - a.value)

    return result
  },
}
