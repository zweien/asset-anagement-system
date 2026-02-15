import { Request, Response } from 'express'
import { FieldService, CreateFieldDto, UpdateFieldDto } from '../services/field.service'

// 统一响应格式
const sendSuccess = <T>(res: Response, data: T, message?: string) => {
  res.json({ success: true, data, message })
}

const sendError = (res: Response, error: string, statusCode = 400) => {
  res.status(statusCode).json({ success: false, error })
}

// 字段配置控制器
export const FieldController = {
  // GET /api/fields - 获取所有字段配置
  async getAll(req: Request, res: Response) {
    try {
      const fields = await FieldService.getAll()
      sendSuccess(res, fields)
    } catch (error) {
      sendError(res, '获取字段配置列表失败', 500)
    }
  },

  // GET /api/fields/:id - 获取单个字段配置
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const field = await FieldService.getById(id)

      if (!field) {
        return sendError(res, '字段配置不存在', 404)
      }

      sendSuccess(res, field)
    } catch (error) {
      sendError(res, '获取字段配置失败', 500)
    }
  },

  // POST /api/fields - 创建字段配置
  async create(req: Request, res: Response) {
    try {
      const data: CreateFieldDto = req.body

      // 基本验证
      if (!data.name || !data.label || !data.type) {
        return sendError(res, 'name, label, type 为必填字段')
      }

      const result = await FieldService.create(data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      sendSuccess(res, result.data, '字段配置创建成功')
    } catch (error) {
      sendError(res, '创建字段配置失败', 500)
    }
  },

  // PUT /api/fields/:id - 更新字段配置
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data: UpdateFieldDto = req.body

      const result = await FieldService.update(id, data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      sendSuccess(res, result.data, '字段配置更新成功')
    } catch (error) {
      sendError(res, '更新字段配置失败', 500)
    }
  },

  // DELETE /api/fields/:id - 删除字段配置
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await FieldService.delete(id)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      sendSuccess(res, null, '字段配置删除成功')
    } catch (error) {
      sendError(res, '删除字段配置失败', 500)
    }
  },

  // PUT /api/fields/reorder - 重新排序
  async reorder(req: Request, res: Response) {
    try {
      const { orders } = req.body

      if (!Array.isArray(orders) || orders.length === 0) {
        return sendError(res, 'orders 必须是非空数组')
      }

      // 验证每个项
      for (const item of orders) {
        if (!item.id || typeof item.order !== 'number') {
          return sendError(res, '每个项必须包含 id 和 order')
        }
      }

      const result = await FieldService.reorder(orders)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      sendSuccess(res, null, '字段排序更新成功')
    } catch (error) {
      sendError(res, '重新排序失败', 500)
    }
  },
}
