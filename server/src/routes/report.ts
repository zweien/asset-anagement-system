import { Router } from 'express'
import { ReportController } from '../controllers/report.controller'

const router = Router()

// 报表模板 CRUD
router.get('/templates', ReportController.getTemplates)
router.get('/templates/:id', ReportController.getTemplate)
router.post('/templates', ReportController.createTemplate)
router.put('/templates/:id', ReportController.updateTemplate)
router.delete('/templates/:id', ReportController.deleteTemplate)

// 获取报表数据
router.get('/data', ReportController.getReportData)

export default router
