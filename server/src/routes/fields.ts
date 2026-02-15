import { Router } from 'express'
import { FieldController } from '../controllers/field.controller'

const router = Router()

// GET /api/fields - 获取所有字段配置
router.get('/', FieldController.getAll)

// GET /api/fields/:id - 获取单个字段配置
router.get('/:id', FieldController.getById)

// POST /api/fields - 创建字段配置
router.post('/', FieldController.create)

// PUT /api/fields/:id - 更新字段配置
router.put('/:id', FieldController.update)

// DELETE /api/fields/:id - 删除字段配置
router.delete('/:id', FieldController.delete)

// PUT /api/fields/reorder - 重新排序
router.put('/reorder', FieldController.reorder)

export default router
