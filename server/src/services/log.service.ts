import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'LOGIN' | 'LOGOUT'

export interface CreateLogDto {
  action: LogAction
  entityType: string
  entityId?: string
  userId?: string
  userName?: string
  oldValue?: any
  newValue?: any
  ip?: string
  userAgent?: string
}

export interface LogQueryParams {
  page?: number
  pageSize?: number
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export const LogService = {
  // 创建日志
  async create(data: CreateLogDto) {
    try {
      const log = await prisma.operationLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          userName: data.userName,
          oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
          newValue: data.newValue ? JSON.stringify(data.newValue) : null,
          ip: data.ip,
          userAgent: data.userAgent,
        },
      })
      return { success: true, data: log }
    } catch (error) {
      console.error('创建日志失败:', error)
      return { success: false, error: '创建日志失败' }
    }
  },

  // 获取日志列表
  async getAll(params: LogQueryParams) {
    const {
      page = 1,
      pageSize = 20,
      action,
      entityType,
      userId,
      startDate,
      endDate,
    } = params

    const where: any = {}

    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (userId) where.userId = userId

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const total = await prisma.operationLog.count({ where })
    const data = await prisma.operationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      success: true,
      data: {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  // 获取单个日志详情
  async getById(id: string) {
    const log = await prisma.operationLog.findUnique({
      where: { id },
    })

    if (!log) {
      return { success: false, error: '日志不存在' }
    }

    return { success: true, data: log }
  },

  // 获取操作统计
  async getStats() {
    const total = await prisma.operationLog.count()

    const actionStats = await prisma.operationLog.groupBy({
      by: ['action'],
      _count: { id: true },
    })

    const entityTypeStats = await prisma.operationLog.groupBy({
      by: ['entityType'],
      _count: { id: true },
    })

    return {
      success: true,
      data: {
        total,
        byAction: actionStats.map((s) => ({ action: s.action, count: s._count.id })),
        byEntityType: entityTypeStats.map((s) => ({ entityType: s.entityType, count: s._count.id })),
      },
    }
  },
}
