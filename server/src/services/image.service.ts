import { PrismaClient } from '@prisma/client'
import { mkdir, writeFile, unlink, readFile } from 'fs/promises'
import { existsSync, createReadStream } from 'fs'
import path from 'path'
import archiver from 'archiver'

const prisma = new PrismaClient()

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

// 确保上传目录存在
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export const ImageService = {
  // 上传图片
  async uploadImage(assetId: string, file: Express.Multer.File) {
    await ensureUploadDir()

    // 生成唯一文件名
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // 保存文件
    await writeFile(filepath, file.buffer)

    // 创建数据库记录
    const image = await prisma.assetImage.create({
      data: {
        assetId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filepath,
      },
    })

    return { success: true, data: image }
  },

  // 获取资产的所有图片
  async getAssetImages(assetId: string) {
    const images = await prisma.assetImage.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: images }
  },

  // 删除图片
  async deleteImage(id: string) {
    const image = await prisma.assetImage.findUnique({
      where: { id },
    })

    if (!image) {
      return { success: false, error: '图片不存在' }
    }

    // 删除文件
    try {
      await unlink(image.path)
    } catch {
      // 文件可能已不存在
    }

    // 删除数据库记录
    await prisma.assetImage.delete({
      where: { id },
    })

    return { success: true }
  },

  // 获取图片信息
  async getImageById(id: string) {
    const image = await prisma.assetImage.findUnique({
      where: { id },
    })
    if (!image) {
      return { success: false, error: '图片不存在' }
    }
    return { success: true, data: image }
  },

  // 批量导出图片为 ZIP
  async exportImagesAsZip(assetIds?: string[], status?: string) {
    try {
      // 构建查询条件
      const assetWhere: any = { deletedAt: null }
      if (assetIds && assetIds.length > 0) {
        assetWhere.id = { in: assetIds }
      }
      if (status) {
        assetWhere.status = status
      }

      // 获取资产及其图片
      const assets = await prisma.asset.findMany({
        where: assetWhere,
        include: {
          images: true,
          category: { select: { name: true } },
        },
      })

      // 收集所有图片
      const images: { path: string; name: string; assetName: string }[] = []
      assets.forEach((asset) => {
        asset.images.forEach((img) => {
          if (existsSync(img.path)) {
            images.push({
              path: img.path,
              name: img.filename,
              assetName: asset.name.replace(/[<>:"/\\|?*]/g, '_'), // 清理文件名
            })
          }
        })
      })

      if (images.length === 0) {
        return { success: false, error: '没有可导出的图片' }
      }

      // 创建 ZIP 流
      const archive = archiver('zip', { zlib: { level: 9 } })
      const chunks: Buffer[] = []

      return new Promise((resolve) => {
        archive.on('data', (chunk) => chunks.push(chunk))
        archive.on('end', () => {
          const buffer = Buffer.concat(chunks)
          resolve({
            success: true,
            data: {
              buffer,
              count: images.length,
              filename: `资产图片_${new Date().toISOString().split('T')[0]}.zip`,
            },
          })
        })
        archive.on('error', (err) => {
          resolve({ success: false, error: err.message })
        })

        // 添加图片到 ZIP
        images.forEach((img, index) => {
          const stream = createReadStream(img.path)
          const ext = path.extname(img.name)
          archive.append(stream, {
            name: `${img.assetName}/${String(index + 1).padStart(3, '0')}${ext}`,
          })
        })

        archive.finalize()
      })
    } catch (error) {
      console.error('导出图片失败:', error)
      return { success: false, error: '导出图片失败' }
    }
  },
}
