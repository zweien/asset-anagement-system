import { Router } from 'express'
import { ExportController } from '../controllers/export.controller'

const router = Router()

// 导出为 Excel
router.post('/excel', ExportController.exportExcel)

// 导出为 CSV
router.post('/csv', ExportController.exportCSV)

export default router
