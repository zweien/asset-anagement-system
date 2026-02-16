import { Router } from 'express'
import multer from 'multer'
import { ImportController } from '../controllers/import.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 所有路由需要认证和录入员权限
router.use(authMiddleware, editorMiddleware)

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 Excel 文件 (.xlsx, .xls)'))
    }
  },
})

// 下载导入模板
router.get('/template', ImportController.downloadTemplate)

// 解析 Excel 文件
router.post('/parse', upload.single('file'), ImportController.parse)

// 执行导入
router.post('/execute', ImportController.import)

export default router
