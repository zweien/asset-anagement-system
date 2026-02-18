import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'
import { aiRateLimitMiddleware } from '../middleware/ai-rate-limit'
import { chat, getStatus, getConfig, updateConfig, testConfig } from '../controllers/ai.controller'

const router = Router()

// 所有 AI 路由都需要认证
router.use(authMiddleware)

// AI 聊天接口 - 需要限流
router.post('/chat', aiRateLimitMiddleware, chat)

// 获取 AI 状态 - 所有登录用户可访问
router.get('/status', getStatus)

// 获取 AI 配置 - 仅管理员可访问
router.get('/config', adminMiddleware, getConfig)

// 更新 AI 配置 - 仅管理员可访问
router.put('/config', adminMiddleware, updateConfig)

// 测试 AI 配置连接 - 仅管理员可访问
router.post('/config/test', adminMiddleware, testConfig)

export default router
