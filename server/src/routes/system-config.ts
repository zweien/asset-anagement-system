import { Router } from 'express'
import { SystemConfigController } from '../controllers/system-config.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 系统配置
 *   description: 系统配置相关接口
 */

// 公开配置（不需要认证）
/**
 * @swagger
 * /system-config/public:
 *   get:
 *     summary: 获取公开系统配置
 *     tags: [系统配置]
 *     security: []
 *     responses:
 *       200:
 *         description: 成功获取配置
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
 *                     logo:
 *                       type: string
 *                     name:
 *                       type: string
 */
router.get('/public', SystemConfigController.getPublicConfig)

// 以下路由需要管理员权限
router.use(authMiddleware)
router.use(adminMiddleware)

/**
 * @swagger
 * /system-config:
 *   get:
 *     summary: 获取所有系统配置（管理员）
 *     tags: [系统配置]
 *     responses:
 *       200:
 *         description: 成功获取配置列表
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       key:
 *                         type: string
 *                       value:
 *                         type: string
 *                       description:
 *                         type: string
 */
router.get('/', SystemConfigController.getAll)

/**
 * @swagger
 * /system-config/logo:
 *   get:
 *     summary: 获取系统Logo（管理员）
 *     tags: [系统配置]
 *     responses:
 *       200:
 *         description: 成功获取Logo
 */
router.get('/logo', SystemConfigController.getLogo)

/**
 * @swagger
 * /system-config/logo:
 *   post:
 *     summary: 上传系统Logo（管理员）
 *     tags: [系统配置]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo上传成功
 */
router.post('/logo', SystemConfigController.uploadLogoMiddleware, SystemConfigController.uploadLogo)

/**
 * @swagger
 * /system-config/name:
 *   get:
 *     summary: 获取系统名称（管理员）
 *     tags: [系统配置]
 *     responses:
 *       200:
 *         description: 成功获取系统名称
 */
router.get('/name', SystemConfigController.getSystemName)

/**
 * @swagger
 * /system-config/name:
 *   put:
 *     summary: 设置系统名称（管理员）
 *     tags: [系统配置]
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
 *     responses:
 *       200:
 *         description: 系统名称设置成功
 */
router.put('/name', SystemConfigController.setSystemName)

export default router
