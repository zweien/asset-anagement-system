import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { idSchema, paginationSchema } from '../middleware/validation.middleware'
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
  updateStatusSchema,
  resetPasswordSchema,
} from '../validators'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 用户管理
 *   description: 用户管理相关接口（仅管理员）
 */

// 所有用户路由都需要认证 + 管理员权限
router.use(authMiddleware)
router.use(adminMiddleware)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [用户管理]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: 未授权或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validate(paginationSchema, 'query'), UserController.getAll)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 获取单个用户详情
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', UserController.getById)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 创建用户
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EDITOR, USER]
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 用户创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 输入数据无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createUserSchema), UserController.create)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 更新用户信息
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
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
 *                   $ref: '#/components/schemas/User'
 */
router.put('/:id', validate(updateUserSchema), UserController.update)

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: 更新用户角色
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EDITOR, USER]
 *     responses:
 *       200:
 *         description: 角色更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/:id/role', validate(updateRoleSchema), UserController.updateRole)

/**
 * @swagger
 * /users/{id}/status:
 *   put:
 *     summary: 更新用户状态
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 状态更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/:id/status', validate(updateStatusSchema), UserController.updateStatus)

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: 重置用户密码
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: 密码重置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/:id/password', validate(resetPasswordSchema), UserController.resetPassword)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 删除用户
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 不能删除自己或最后一个管理员
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', UserController.delete)

export default router
