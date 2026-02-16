import { Router } from 'express'
import { DBImportController } from '../controllers/db-import.controller'

const router = Router()

// 测试数据库连接
router.post('/test-connection', DBImportController.testConnection)

// 获取数据库表列表
router.post('/tables', DBImportController.getTables)

// 预览表数据
router.post('/preview', DBImportController.previewData)

// 执行导入
router.post('/execute', DBImportController.importData)

export default router
