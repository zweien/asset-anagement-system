import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 所有用户路由都需要认证 + 管理员权限
router.use(authMiddleware)
router.use(adminMiddleware)

// 用户管理路由
router.get('/', UserController.getAll)                    // 获取用户列表
router.get('/:id', UserController.getById)               // 获取单个用户
router.post('/', UserController.create)                   // 创建用户
router.put('/:id', UserController.update)                 // 更新用户信息
router.put('/:id/role', UserController.updateRole)        // 更新用户角色
router.put('/:id/status', UserController.updateStatus)    // 更新用户状态
router.put('/:id/password', UserController.resetPassword) // 重置密码
router.delete('/:id', UserController.delete)              // 删除用户

export default router
