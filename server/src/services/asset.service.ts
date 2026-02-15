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
    const {
      page = 1,
      pageSize = 20,
      search,
      categoryId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
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
}
