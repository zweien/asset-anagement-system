import { Router } from 'express'
import { AssetController } from '../controllers/asset.controller'

const router = Router()

// GET /api/assets - 获取资产列表（分页）
router.get('/', AssetController.getAll)

// GET /api/assets/:id - 获取单个资产
router.get('/:id', AssetController.getById)

// POST /api/assets - 创建资产
router.post('/', AssetController.create)

// PUT /api/assets/:id - 更新资产
router.put('/:id', AssetController.update)

// DELETE /api/assets/:id - 删除资产（软删除）
router.delete('/:id', AssetController.delete)

// POST /api/assets/batch-delete - 批量删除
router.post('/batch-delete', AssetController.batchDelete)

export default router
