import { Router } from 'express'
import fieldsRouter from './fields'
import assetsRouter from './assets'
import importRouter from './import'
import exportRouter from './export'
import imagesRouter from './images'
import logsRouter from './logs'
import dbImportRouter from './db-import'
import reportRouter from './report'
import authRouter from './auth'
import usersRouter from './users'
import backupRouter from './backup'

const router = Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// 字段配置路由
router.use('/fields', fieldsRouter)

// 资产路由
router.use('/assets', assetsRouter)

// 导入路由
router.use('/import', importRouter)

// 导出路由
router.use('/export', exportRouter)

// 图片路由
router.use('/', imagesRouter)

// 日志路由
router.use('/logs', logsRouter)

// 数据库导入路由
router.use('/db-import', dbImportRouter)

// 报表路由
router.use('/reports', reportRouter)

// 认证路由
router.use('/auth', authRouter)

// 用户管理路由（仅管理员）
router.use('/users', usersRouter)

// 备份路由（仅管理员）
router.use('/backup', backupRouter)

export default router
