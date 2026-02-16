import { Router } from 'express'
import { BackupController } from '../controllers/backup.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 数据备份
 *   description: 数据备份与恢复接口（仅管理员）
 */

// 所有备份路由需要管理员权限
router.use(authMiddleware)
router.use(adminMiddleware)

/**
 * @swagger
 * /backup:
 *   post:
 *     summary: 创建数据备份
 *     tags: [数据备份]
 *     responses:
 *       200:
 *         description: 备份创建成功
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
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', BackupController.createBackup)

/**
 * @swagger
 * /backup/list:
 *   get:
 *     summary: 获取备份文件列表
 *     tags: [数据备份]
 *     responses:
 *       200:
 *         description: 成功获取备份列表
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
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/list', BackupController.getBackupList)

/**
 * @swagger
 * /backup/download/{filename}:
 *   get:
 *     summary: 下载备份文件
 *     tags: [数据备份]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: 备份文件名
 *     responses:
 *       200:
 *         description: 备份文件下载
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: 备份文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/download/:filename', BackupController.downloadBackup)

/**
 * @swagger
 * /backup/restore/{filename}:
 *   post:
 *     summary: 从备份恢复数据
 *     tags: [数据备份]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: 备份文件名
 *     responses:
 *       200:
 *         description: 恢复成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: 备份文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/restore/:filename', BackupController.restoreBackup)

/**
 * @swagger
 * /backup/{filename}:
 *   delete:
 *     summary: 删除备份文件
 *     tags: [数据备份]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: 备份文件名
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: 备份文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:filename', BackupController.deleteBackup)

export default router
