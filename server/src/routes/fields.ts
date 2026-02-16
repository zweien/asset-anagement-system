import { Router } from 'express'
import { FieldController } from '../controllers/field.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { createFieldConfigSchema, updateFieldConfigSchema } from '../validators'
import { z } from 'zod'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 字段配置
 *   description: 动态字段配置管理接口
 */

// 字段排序 schema
const reorderSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
})

// 所有路由需要认证
router.use(authMiddleware)

/**
 * @swagger
 * /fields:
 *   get:
 *     summary: 获取所有字段配置
 *     tags: [字段配置]
 *     responses:
 *       200:
 *         description: 成功获取字段配置列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FieldConfig'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', FieldController.getAll)

/**
 * @swagger
 * /fields/{id}:
 *   get:
 *     summary: 获取单个字段配置
 *     tags: [字段配置]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 字段配置ID
 *     responses:
 *       200:
 *         description: 成功获取字段配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FieldConfig'
 *       404:
 *         description: 字段配置不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', FieldController.getById)

/**
 * @swagger
 * /fields:
 *   post:
 *     summary: 创建字段配置
 *     tags: [字段配置]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - label
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: 字段名称（英文标识）
 *               label:
 *                 type: string
 *                 description: 字段标签（显示名称）
 *               type:
 *                 type: string
 *                 enum: [TEXT, TEXTAREA, NUMBER, DATE, SELECT, MULTISELECT]
 *                 description: 字段类型
 *               required:
 *                 type: boolean
 *                 default: false
 *                 description: 是否必填
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 选项列表（SELECT/MULTISELECT类型使用）
 *               visible:
 *                 type: boolean
 *                 default: true
 *                 description: 是否显示
 *               order:
 *                 type: integer
 *                 description: 排序顺序
 *     responses:
 *       201:
 *         description: 字段配置创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FieldConfig'
 *       400:
 *         description: 输入数据无效或字段名称已存在
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
router.post('/', editorMiddleware, validate(createFieldConfigSchema), FieldController.create)

/**
 * @swagger
 * /fields/{id}:
 *   put:
 *     summary: 更新字段配置
 *     tags: [字段配置]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 字段配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, TEXTAREA, NUMBER, DATE, SELECT, MULTISELECT]
 *               required:
 *                 type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               visible:
 *                 type: boolean
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FieldConfig'
 *       404:
 *         description: 字段配置不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', editorMiddleware, validate(updateFieldConfigSchema), FieldController.update)

/**
 * @swagger
 * /fields/{id}:
 *   delete:
 *     summary: 删除字段配置
 *     tags: [字段配置]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 字段配置ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: 字段配置不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', editorMiddleware, FieldController.delete)

/**
 * @swagger
 * /fields/reorder:
 *   put:
 *     summary: 重新排序字段
 *     tags: [字段配置]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orders
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: 排序成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/reorder', editorMiddleware, validate(reorderSchema), FieldController.reorder)

export default router
