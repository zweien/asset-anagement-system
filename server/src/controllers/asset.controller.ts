import { Request, Response } from 'express'
import { AssetService, CreateAssetDto, UpdateAssetDto, AssetQueryParams } from '../services/asset.service'
import { LogService } from '../services/log.service'

// 统一响应格式
const sendSuccess = <T>(res: Response, data: T, message?: string) => {
  res.json({ success: true, data, message })
}

const sendError = (res: Response, error: string, statusCode = 400) => {
  res.status(statusCode).json({ success: false, error })
}

// 资产控制器
export const AssetController = {
  // GET /api/assets - 获取资产列表
  async getAll(req: Request, res: Response) {
    try {
      const params: AssetQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 20, 100),
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        status: req.query.status as string,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        filters: req.query.filters as string,
      }

      const result = await AssetService.getAll(params)
      sendSuccess(res, result)
    } catch (error) {
      sendError(res, '获取资产列表失败', 500)
    }
  },

  // GET /api/assets/:id - 获取单个资产
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const asset = await AssetService.getById(id)

      if (!asset) {
        return sendError(res, '资产不存在', 404)
      }

      // 解析 data 字段
      const assetData = {
        ...asset,
        data: JSON.parse(asset.data || '{}'),
      }

      sendSuccess(res, assetData)
    } catch (error) {
      sendError(res, '获取资产详情失败', 500)
    }
  },

  // POST /api/assets - 创建资产
  async create(req: Request, res: Response) {
    try {
      const data: CreateAssetDto = req.body
      const user = (req as any).user

      // 基本验证
      if (!data.name) {
        return sendError(res, 'name 为必填字段')
      }

      const result = await AssetService.create(data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      await LogService.create({
        action: 'CREATE',
        entityType: 'Asset',
        entityId: result.data!.id,
        userId: user?.id,
        userName: user?.name || user?.username,
        newValue: result.data,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      sendSuccess(res, result.data, '资产创建成功')
    } catch (error) {
      sendError(res, '创建资产失败', 500)
    }
  },

  // PUT /api/assets/:id - 更新资产
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data: UpdateAssetDto = req.body
      const user = (req as any).user

      // 获取旧值用于日志
      const oldAsset = await AssetService.getById(id)

      const result = await AssetService.update(id, data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      await LogService.create({
        action: 'UPDATE',
        entityType: 'Asset',
        entityId: id,
        userId: user?.id,
        userName: user?.name || user?.username,
        oldValue: oldAsset,
        newValue: result.data,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      sendSuccess(res, result.data, '资产更新成功')
    } catch (error) {
      sendError(res, '更新资产失败', 500)
    }
  },

  // DELETE /api/assets/:id - 删除资产（软删除）
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = (req as any).user

      // 获取旧值用于日志
      const oldAsset = await AssetService.getById(id)

      const result = await AssetService.delete(id)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      await LogService.create({
        action: 'DELETE',
        entityType: 'Asset',
        entityId: id,
        userId: user?.id,
        userName: user?.name || user?.username,
        oldValue: oldAsset,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      sendSuccess(res, null, '资产删除成功')
    } catch (error) {
      sendError(res, '删除资产失败', 500)
    }
  },

  // POST /api/assets/batch-delete - 批量删除
  async batchDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body
      const user = (req as any).user

      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(res, 'ids 必须是非空数组')
      }

      const result = await AssetService.batchDelete(ids)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录批量删除日志
      await LogService.create({
        action: 'DELETE',
        entityType: 'Asset',
        userId: user?.id,
        userName: user?.name || user?.username,
        newValue: { count: result.count, ids },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      })

      sendSuccess(res, { count: result.count }, `成功删除 ${result.count} 条资产`)
    } catch (error) {
      sendError(res, '批量删除失败', 500)
    }
  },

  // GET /api/assets/grouped - 分组查询
  async getGrouped(req: Request, res: Response) {
    try {
      const groupBy = (req.query.groupBy as string) || 'status'
      const params: AssetQueryParams = {
        pageSize: parseInt(req.query.pageSize as string) || 50,
      }

      const result = await AssetService.getGrouped(groupBy, params)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      sendSuccess(res, result.data)
    } catch (error) {
      sendError(res, '分组查询失败', 500)
    }
  },
}
