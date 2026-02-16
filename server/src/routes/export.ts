import { Router } from 'express'
import { ExportController } from '../controllers/export.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 所有路由需要认证（所有认证用户都可以导出）
router.use(authMiddleware)

// 导出为 Excel
router.post('/excel', ExportController.exportExcel)

// 导出为 CSV
router.post('/csv', ExportController.exportCSV)

export default router
