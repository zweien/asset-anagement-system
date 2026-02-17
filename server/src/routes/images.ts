import { Router } from 'express'
import multer from 'multer'
import { ImageController } from '../controllers/image.controller'
import { authMiddleware, editorMiddleware } from '../middleware/auth.middleware'

const router = Router()

// 配置 multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 JPEG, PNG, GIF, WebP 格式的图片'))
    }
  },
})

// 获取资产的所有图片 - 所有认证用户
router.get('/assets/:assetId/images', authMiddleware, ImageController.getByAsset)

// 获取图片文件 - 公开访问（用于 img 标签显示）
router.get('/images/:id', ImageController.serve)

// 批量导出图片 - 所有认证用户
router.post('/images/export', authMiddleware, ImageController.exportZip)

// 上传图片到指定资产 - 录入员及以上
router.post('/assets/:assetId/images', authMiddleware, editorMiddleware, upload.single('image'), ImageController.upload)

// 删除图片 - 录入员及以上
router.delete('/images/:id', authMiddleware, editorMiddleware, ImageController.delete)

export default router
