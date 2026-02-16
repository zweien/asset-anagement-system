import { Router } from 'express'
import { AssetController } from '../controllers/asset.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { createAssetSchema, updateAssetSchema, assetQuerySchema, batchDeleteSchema } from '../validators'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 资产
 *   description: 资产管理相关接口
 */

// 所有路由需要认证
router.use(authMiddleware)

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: 获取资产列表（分页）
 *     tags: [资产]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, IDLE, DAMAGED, SCRAPPED]
 *         description: 资产状态筛选
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 分类ID筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（资产名称或编码）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, status, createdAt, updatedAt]
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: 排序方向
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON格式的动态字段筛选条件
 *     responses:
 *       200:
 *         description: 成功获取资产列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validate(assetQuerySchema, 'query'), AssetController.getAll)

/**
 * @swagger
 * /assets/grouped:
 *   get:
 *     summary: 分组查询资产
 *     tags: [资产]
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [status, categoryId]
 *         required: true
 *         description: 分组字段
 *     responses:
 *       200:
 *         description: 成功获取分组数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/grouped', validate(assetQuerySchema, 'query'), AssetController.getGrouped)

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: 获取单个资产详情
 *     tags: [资产]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 资产ID
 *     responses:
 *       200:
 *         description: 成功获取资产详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', AssetController.getById)

/**
 * @swagger
 * /assets:
 *   post:
 *     summary: 创建资产
 *     tags: [资产]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 资产名称
 *               code:
 *                 type: string
 *                 description: 资产编码
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, IDLE, DAMAGED, SCRAPPED]
 *                 default: ACTIVE
 *                 description: 资产状态
 *               categoryId:
 *                 type: string
 *                 description: 分类ID
 *               data:
 *                 type: object
 *                 description: 动态字段数据
 *     responses:
 *       201:
 *         description: 资产创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: 输入数据无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', editorMiddleware, validate(createAssetSchema), AssetController.create)

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     summary: 更新资产
 *     tags: [资产]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 资产ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 资产名称
 *               code:
 *                 type: string
 *                 description: 资产编码
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, IDLE, DAMAGED, SCRAPPED]
 *                 description: 资产状态
 *               categoryId:
 *                 type: string
 *                 description: 分类ID
 *               data:
 *                 type: object
 *                 description: 动态字段数据
 *     responses:
 *       200:
 *         description: 资产更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: 输入数据无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', editorMiddleware, validate(updateAssetSchema), AssetController.update)

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     summary: 删除资产（软删除）
 *     tags: [资产]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 资产ID
 *     responses:
 *       200:
 *         description: 资产删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', editorMiddleware, AssetController.delete)

/**
 * @swagger
 * /assets/batch-delete:
 *   post:
 *     summary: 批量删除资产
 *     tags: [资产]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: 要删除的资产ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *       400:
 *         description: 输入数据无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/batch-delete', editorMiddleware, validate(batchDeleteSchema), AssetController.batchDelete)

export default router
