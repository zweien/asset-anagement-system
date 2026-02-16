import { Router } from 'express'
import { FieldController } from '../controllers/field.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { createFieldConfigSchema, updateFieldConfigSchema } from '../validators'
import { z } from 'zod'

const router = Router()

// 字段排序 schema
const reorderSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
})

// 所有路由需要认证
router.use(authMiddleware)

// GET /api/fields - 获取所有字段配置 - 所有认证用户
router.get('/', FieldController.getAll)

// GET /api/fields/:id - 获取单个字段配置 - 所有认证用户
router.get('/:id', FieldController.getById)

// POST /api/fields - 创建字段配置 - 录入员及以上
router.post('/', editorMiddleware, validate(createFieldConfigSchema), FieldController.create)

// PUT /api/fields/:id - 更新字段配置 - 录入员及以上
router.put('/:id', editorMiddleware, validate(updateFieldConfigSchema), FieldController.update)

// DELETE /api/fields/:id - 删除字段配置 - 录入员及以上
router.delete('/:id', editorMiddleware, FieldController.delete)

// PUT /api/fields/reorder - 重新排序 - 录入员及以上
router.put('/reorder', editorMiddleware, validate(reorderSchema), FieldController.reorder)

export default router
