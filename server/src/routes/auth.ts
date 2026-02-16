import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { loginSchema, registerSchema, changePasswordSchema } from '../validators'

const router = Router()

// 公开路由
router.post('/login', validate(loginSchema), AuthController.login)
router.post('/register', validate(registerSchema), AuthController.register)
router.post('/verify', AuthController.verifyToken)

// 需要认证的路由
router.get('/me', authMiddleware, AuthController.getCurrentUser)
router.post('/change-password', authMiddleware, validate(changePasswordSchema), AuthController.changePassword)

export default router
