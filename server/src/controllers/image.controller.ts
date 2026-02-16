import { Request, Response } from 'express'
import { ImageService } from '../services/image.service'
import { readFile } from 'fs/promises'

export const ImageController = {
  // 上传图片
  async upload(req: Request, res: Response) {
    try {
      const { assetId } = req.params
      if (!req.file) {
        return res.status(400).json({ success: false, error: '请选择图片文件' })
      }

      const result = await ImageService.uploadImage(assetId, req.file)
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      })
    }
  },

  // 获取资产的图片列表
  async getByAsset(req: Request, res: Response) {
    try {
      const { assetId } = req.params
      const result = await ImageService.getAssetImages(assetId)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取图片失败',
      })
    }
  },

  // 获取图片文件
  async serve(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await ImageService.getImageById(id)

      if (!result.success || !result.data) {
        return res.status(404).json(result)
      }

      const image = result.data
      const fileBuffer = await readFile(image.path)

      res.setHeader('Content-Type', image.mimeType)
      res.send(fileBuffer)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取图片失败',
      })
    }
  },

  // 删除图片
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await ImageService.deleteImage(id)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '删除失败',
      })
    }
  },

  // 批量导出图片
  async exportZip(req: Request, res: Response) {
    try {
      const { assetIds, status } = req.body as {
        assetIds?: string[]
        status?: string
      }

      const result = (await ImageService.exportImagesAsZip(assetIds, status)) as any

      if (!result.success) {
        return res.status(400).json(result)
      }

      res.setHeader('Content-Type', 'application/zip')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(result.data.filename)}"`
      )
      res.send(result.data.buffer)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      })
    }
  },
}
