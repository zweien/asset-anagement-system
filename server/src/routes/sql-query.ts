import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'
import { executeQuery, getAllowedTables, getTableSchema } from '../controllers/sql-query.controller'

const router = Router()

// 所有 SQL 查询路由都需要认证和管理员权限
router.use(authMiddleware)
router.use(adminMiddleware)

// 执行 SQL 查询
router.post('/execute', executeQuery)

// 获取允许查询的表列表
router.get('/tables', getAllowedTables)

// 获取表结构
router.get('/tables/:tableName/schema', getTableSchema)

export default router
