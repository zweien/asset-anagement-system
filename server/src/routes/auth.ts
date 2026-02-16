import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 公开路由
router.post('/login', AuthController.login)
router.post('/register', AuthController.register)
router.post('/verify', AuthController.verifyToken)

// 需要认证的路由
router.get('/me', authMiddleware, AuthController.getCurrentUser)
router.post('/change-password', authMiddleware, AuthController.changePassword)

export default router
