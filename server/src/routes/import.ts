import { Router } from 'express'
import multer from 'multer'
import { ImportController } from '../controllers/import.controller'

const router = Router()

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

// 解析 Excel 文件
router.post('/parse', upload.single('file'), ImportController.parse)

// 执行导入
router.post('/execute', ImportController.import)

export default router
