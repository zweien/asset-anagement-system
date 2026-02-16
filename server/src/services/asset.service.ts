import { PrismaClient, Asset } from '@prisma/client'

const prisma = new PrismaClient()

// 资产状态枚举
export enum AssetStatusEnum {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  SCRAPPED = 'SCRAPPED',
}

// 有效的资产状态
const VALID_STATUSES = Object.values(AssetStatusEnum)

// 创建资产 DTO
export interface CreateAssetDto {
  name: string
  code?: string
  categoryId?: string
  status?: string
  data?: Record<string, unknown> // 动态字段数据
}

// 更新资产 DTO
export interface UpdateAssetDto {
  name?: string
  code?: string
  categoryId?: string
  status?: string
  data?: Record<string, unknown>
}

// 查询参数
export interface AssetQueryParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  // 动态字段筛选
  filters?: string // JSON 字符串，包含字段筛选条件
}

// 分页响应
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 验证状态
function validateStatus(status: string): boolean {
  return VALID_STATUSES.includes(status as AssetStatusEnum)
}

// 资产服务
export const AssetService = {
  // 获取资产列表（分页）
  async getAll(params: AssetQueryParams): Promise<PaginatedResult<Asset>> {
    console.log('收到请求参数:', JSON.stringify(params))
    const {
      page = 1,
      pageSize = 20,
      search,
      categoryId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters,
    } = params

    const where: any = {
      deletedAt: null, // 排除软删除
    }

    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    // 分类筛选
    if (categoryId) {
      where.categoryId = categoryId
    }

    // 状态筛选
    if (status) {
      where.status = status
    }

    // 解析筛选条件
    let filterObj: Record<string, any> = {}
    if (filters) {
      console.log('原始 filters 字符串:', filters)
      try {
        filterObj = JSON.parse(filters)
        console.log('筛选条件:', JSON.stringify(filterObj))
      } catch (e) {
        console.log('筛选条件解析失败:', e)
      }
    }

    // 基础列筛选（name, code, categoryId, status, createdAt）
    const baseColumns = ['name', 'code', 'categoryId', 'status', 'createdAt']
    for (const [fieldName, condition] of Object.entries(filterObj)) {
      if (baseColumns.includes(fieldName)) {
        const { operator, value: filterValue } = condition as any
        console.log(`应用筛选: ${fieldName}, 操作符: ${operator}, 值: ${filterValue}`)
        if (operator === 'isEmpty') {
          // SQLite 不支持 { in: [null, ''] }，使用 OR 条件
          where.OR = where.OR || []
          where.OR.push({ [fieldName]: null })
          where.OR.push({ [fieldName]: '' })
        } else if (operator === 'isNotEmpty') {
          // SQLite 不支持 { not: { in: [null, ''] } }，使用 AND 条件
          where[fieldName] = { not: null, not: '' }
        } else if (operator === 'equals') {
          where[fieldName] = filterValue
        } else if (operator === 'notEquals') {
          where[fieldName] = { not: filterValue }
        } else if (operator === 'contains') {
          where[fieldName] = { contains: filterValue }
        } else if (operator === 'notContains') {
          where[fieldName] = { not: { contains: filterValue } }
        } else if (operator === 'startsWith') {
          where[fieldName] = { startsWith: filterValue }
        } else if (operator === 'endsWith') {
          where[fieldName] = { endsWith: filterValue }
        } else if (operator === 'gt' && fieldName !== 'createdAt') {
          where[fieldName] = { gt: Number(filterValue) }
        } else if (operator === 'gte' && fieldName !== 'createdAt') {
          where[fieldName] = { gte: Number(filterValue) }
        } else if (operator === 'lt' && fieldName !== 'createdAt') {
          where[fieldName] = { lt: Number(filterValue) }
        } else if (operator === 'lte' && fieldName !== 'createdAt') {
          where[fieldName] = { lte: Number(filterValue) }
        } else if (operator === 'between') {
          if (fieldName === 'createdAt') {
            const dateConditions: any[] = []
            if (filterValue.startDate) {
              dateConditions.push({ [fieldName]: { gte: new Date(filterValue.startDate) } })
            }
            if (filterValue.endDate) {
              dateConditions.push({ [fieldName]: { lte: new Date(filterValue.endDate) } })
            }
            if (dateConditions.length > 0) {
              where.AND = where.AND || []
              where.AND.push(...dateConditions)
            }
          } else {
            if (filterValue.min !== undefined) {
              where[fieldName] = { ...where[fieldName], gte: Number(filterValue.min) }
            }
            if (filterValue.max !== undefined) {
              where[fieldName] = { ...where[fieldName], lte: Number(filterValue.max) }
            }
          }
        } else if (operator === 'gt' && fieldName === 'createdAt') {
          where[fieldName] = { gt: new Date(filterValue) }
        } else if (operator === 'gte' && fieldName === 'createdAt') {
          where[fieldName] = { gte: new Date(filterValue) }
        } else if (operator === 'lt' && fieldName === 'createdAt') {
          where[fieldName] = { lt: new Date(filterValue) }
        } else if (operator === 'lte' && fieldName === 'createdAt') {
          where[fieldName] = { lte: new Date(filterValue) }
        }
      }
    }

    // 动态字段筛选
    // 由于 SQLite 不支持 JSON 筛选，我们在应用层过滤
    let filteredByFields = false
    let fieldFilterResults: string[] | null = null

    // 筛选条件评估函数
    const evaluateCondition = (value: any, condition: any): boolean => {
      // 新格式：{ operator, value }
      if (condition.operator && condition.value !== undefined) {
        const { operator, value: filterValue } = condition
        const strValue = String(value ?? '').toLowerCase()
        const strFilter = String(filterValue ?? '').toLowerCase()

        switch (operator) {
          case 'contains':
            return strValue.includes(strFilter)
          case 'notContains':
            return !strValue.includes(strFilter)
          case 'equals':
            return strValue === strFilter
          case 'notEquals':
            return strValue !== strFilter
          case 'startsWith':
            return strValue.startsWith(strFilter)
          case 'endsWith':
            return strValue.endsWith(strFilter)
          case 'isEmpty':
            return value === undefined || value === null || value === ''
          case 'isNotEmpty':
            return value !== undefined && value !== null && value !== ''
          case 'gt':
            return Number(value) > Number(filterValue)
          case 'gte':
            return Number(value) >= Number(filterValue)
          case 'lt':
            return Number(value) < Number(filterValue)
          case 'lte':
            return Number(value) <= Number(filterValue)
          case 'between':
            if (filterValue.min !== undefined && Number(value) < filterValue.min) return false
            if (filterValue.max !== undefined && Number(value) > filterValue.max) return false
            if (filterValue.startDate !== undefined) {
              const valDate = new Date(value as string)
              const startDate = new Date(filterValue.startDate)
              if (valDate < startDate) return false
            }
            if (filterValue.endDate !== undefined) {
              const valDate = new Date(value as string)
              const endDate = new Date(filterValue.endDate)
              if (valDate > endDate) return false
            }
            return true
          case 'in':
            if (Array.isArray(filterValue)) {
              const val = Array.isArray(value) ? value : [value]
              return filterValue.some((v: any) => val.includes(v))
            }
            return false
          default:
            return true
        }
      }

      // 旧格式兼容：字符串模糊匹配
      if (typeof condition === 'string') {
        return String(value).toLowerCase().includes(condition.toLowerCase())
      }

      // 旧格式兼容：对象条件
      if (typeof condition === 'object' && condition !== null) {
        const c = condition as any
        if (c.min !== undefined && Number(value) < c.min) return false
        if (c.max !== undefined && Number(value) > c.max) return false
        if (c.startDate !== undefined) {
          const valDate = new Date(value as string)
          const startDate = new Date(c.startDate)
          if (valDate < startDate) return false
        }
        if (c.endDate !== undefined) {
          const valDate = new Date(value as string)
          const endDate = new Date(c.endDate)
          if (valDate > endDate) return false
        }
        if (c.values !== undefined && Array.isArray(c.values)) {
          const val = Array.isArray(value) ? value : [value]
          return c.values.some((v: any) => val.includes(v))
        }
        if (c.eq !== undefined) {
          return value === c.eq
        }
      }
      return true
    }

    // 动态字段筛选（排除基础列）
    const dynamicFilters = Object.entries(filterObj).filter(
      ([fieldName]) => !baseColumns.includes(fieldName)
    )

    if (dynamicFilters.length > 0) {
      try {
        const allAssets = await prisma.asset.findMany({
          where: { deletedAt: null },
          select: { id: true, data: true },
        })

        fieldFilterResults = allAssets
          .filter((asset) => {
            if (!asset.data) return false
            try {
              const data = JSON.parse(asset.data)
              return dynamicFilters.every(([fieldName, condition]) => {
                const value = data[fieldName]
                return evaluateCondition(value, condition)
              })
            } catch {
              return false
            }
          })
          .map((a) => a.id)

        filteredByFields = true
      } catch {
        // 解析失败，忽略筛选
      }
    }

    // 如果有字段筛选结果，添加到 where 条件
    if (filteredByFields && fieldFilterResults !== null) {
      where.id = { in: fieldFilterResults }
    }

    // 计算总数
    const total = await prisma.asset.count({ where })
    const totalPages = Math.ceil(total / pageSize)

    // 查询数据
    const data = await prisma.asset.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
          take: 1, // 只取第一张图片作为封面
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    }
  },

  // 获取单个资产
  async getById(id: string) {
    return prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },

  // 创建资产
  async create(data: CreateAssetDto) {
    // 验证状态
    if (data.status && !validateStatus(data.status)) {
      return {
        success: false,
        error: `无效的状态: ${data.status}，有效状态: ${VALID_STATUSES.join(', ')}`,
      }
    }

    // 检查编号是否重复
    if (data.code) {
      const existing = await prisma.asset.findFirst({
        where: { code: data.code, deletedAt: null },
      })
      if (existing) {
        return { success: false, error: `资产编号 "${data.code}" 已存在` }
      }
    }

    // 验证分类是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })
      if (!category) {
        return { success: false, error: '分类不存在' }
      }
    }

    try {
      const asset = await prisma.asset.create({
        data: {
          name: data.name,
          code: data.code,
          categoryId: data.categoryId,
          status: data.status || AssetStatusEnum.ACTIVE,
          data: JSON.stringify(data.data || {}),
        },
        include: {
          category: true,
        },
      })
      return { success: true, data: asset }
    } catch (error) {
      return { success: false, error: '创建资产失败' }
    }
  },

  // 更新资产
  async update(id: string, data: UpdateAssetDto) {
    // 检查资产是否存在
    const existing = await prisma.asset.findFirst({
      where: { id, deletedAt: null },
    })
    if (!existing) {
      return { success: false, error: '资产不存在' }
    }

    // 验证状态
    if (data.status && !validateStatus(data.status)) {
      return {
        success: false,
        error: `无效的状态: ${data.status}，有效状态: ${VALID_STATUSES.join(', ')}`,
      }
    }

    // 检查编号是否重复
    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.asset.findFirst({
        where: { code: data.code, deletedAt: null },
      })
      if (duplicate) {
        return { success: false, error: `资产编号 "${data.code}" 已存在` }
      }
    }

    // 验证分类
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })
      if (!category) {
        return { success: false, error: '分类不存在' }
      }
    }

    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          categoryId: data.categoryId,
          status: data.status,
          data: data.data ? JSON.stringify(data.data) : undefined,
        },
        include: {
          category: true,
        },
      })
      return { success: true, data: asset }
    } catch (error) {
      return { success: false, error: '更新资产失败' }
    }
  },

  // 删除资产（软删除）
  async delete(id: string) {
    // 检查资产是否存在
    const existing = await prisma.asset.findFirst({
      where: { id, deletedAt: null },
    })
    if (!existing) {
      return { success: false, error: '资产不存在' }
    }

    try {
      await prisma.asset.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: '删除资产失败' }
    }
  },

  // 批量删除
  async batchDelete(ids: string[]) {
    try {
      const result = await prisma.asset.updateMany({
        where: {
          id: { in: ids },
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })
      return { success: true, count: result.count }
    } catch (error) {
      return { success: false, error: '批量删除失败' }
    }
  },

  // 分组查询
  async getGrouped(groupBy: string, params: AssetQueryParams) {
    try {
      // 先获取所有符合条件的资产
      const allAssets = await prisma.asset.findMany({
        where: { deletedAt: null },
        include: {
          category: { select: { id: true, name: true } },
        },
      })

      // 解析动态字段数据
      const assetsWithData = allAssets.map((asset) => ({
        ...asset,
        parsedData: JSON.parse(asset.data || '{}'),
      }))

      // 分组逻辑
      const groups: Record<string, Asset[]> = {}

      assetsWithData.forEach((asset) => {
        let groupKey: string

        if (groupBy === 'status') {
          groupKey = asset.status
        } else if (groupBy === 'categoryId') {
          groupKey = asset.category?.name || '未分类'
        } else if (groupBy === 'createdAt') {
          // 按月份分组
          const date = new Date(asset.createdAt)
          groupKey = `${date.getFullYear()}年${date.getMonth() + 1}月`
        } else {
          // 动态字段分组
          groupKey = String(asset.parsedData[groupBy] || '未设置')
        }

        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(asset)
      })

      // 应用筛选和排序到每个分组
      const result: {
        key: string
        label: string
        count: number
        assets: Asset[]
      }[] = []

      for (const [key, assets] of Object.entries(groups)) {
        result.push({
          key,
          label: key,
          count: assets.length,
          assets: assets.slice(0, params.pageSize || 50), // 限制每组数量
        })
      }

      // 按数量排序
      result.sort((a, b) => b.count - a.count)

      return {
        success: true,
        data: {
          groups: result,
          total: allAssets.length,
          groupBy,
        },
      }
    } catch (error) {
      console.error('分组查询失败:', error)
      return { success: false, error: '分组查询失败' }
    }
  },
}
