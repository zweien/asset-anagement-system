import { Router } from 'express'
import multer from 'multer'
import { ImageController } from '../controllers/image.controller'

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

// 上传图片到指定资产
router.post('/assets/:assetId/images', upload.single('image'), ImageController.upload)

// 获取资产的所有图片
router.get('/assets/:assetId/images', ImageController.getByAsset)

// 获取图片文件
router.get('/images/:id', ImageController.serve)

// 删除图片
router.delete('/images/:id', ImageController.delete)

// 批量导出图片
router.post('/images/export', ImageController.exportZip)

export default router
