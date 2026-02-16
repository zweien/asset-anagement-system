import { Router } from 'express'
import { ReportController } from '../controllers/report.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 所有路由需要认证
router.use(authMiddleware)

// 报表模板查询 - 所有认证用户
router.get('/templates', ReportController.getTemplates)
router.get('/templates/:id', ReportController.getTemplate)

// 获取报表数据 - 所有认证用户
router.get('/data', ReportController.getReportData)

// 报表模板管理（增删改）- 录入员及以上
router.post('/templates', editorMiddleware, ReportController.createTemplate)
router.put('/templates/:id', editorMiddleware, ReportController.updateTemplate)
router.delete('/templates/:id', editorMiddleware, ReportController.deleteTemplate)

export default router
