import { Router } from 'express'
import { LogController } from '../controllers/log.controller'

const router = Router()

// 获取日志列表
router.get('/', LogController.getAll)

// 获取操作统计
router.get('/stats', LogController.getStats)

// 获取单个日志详情
router.get('/:id', LogController.getById)

export default router
