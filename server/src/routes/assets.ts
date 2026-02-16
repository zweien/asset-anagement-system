import { Router } from 'express'
import { AssetController } from '../controllers/asset.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { createAssetSchema, updateAssetSchema, assetQuerySchema, batchDeleteSchema } from '../validators'

const router = Router()

// 所有路由需要认证
router.use(authMiddleware)

// GET /api/assets - 获取资产列表（分页）- 所有认证用户
router.get('/', validate(assetQuerySchema, 'query'), AssetController.getAll)

// GET /api/assets/grouped - 分组查询 - 所有认证用户
router.get('/grouped', validate(assetQuerySchema, 'query'), AssetController.getGrouped)

// GET /api/assets/:id - 获取单个资产 - 所有认证用户
router.get('/:id', AssetController.getById)

// POST /api/assets - 创建资产 - 录入员及以上
router.post('/', editorMiddleware, validate(createAssetSchema), AssetController.create)

// PUT /api/assets/:id - 更新资产 - 录入员及以上
router.put('/:id', editorMiddleware, validate(updateAssetSchema), AssetController.update)

// DELETE /api/assets/:id - 删除资产（软删除）- 录入员及以上
router.delete('/:id', editorMiddleware, AssetController.delete)

// POST /api/assets/batch-delete - 批量删除 - 录入员及以上
router.post('/batch-delete', editorMiddleware, validate(batchDeleteSchema), AssetController.batchDelete)

export default router
