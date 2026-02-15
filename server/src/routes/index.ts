import { Router } from 'express'
import fieldsRouter from './fields'
import assetsRouter from './assets'

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

export default router
