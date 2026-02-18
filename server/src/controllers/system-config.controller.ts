import { Request, Response } from 'express'
import { SystemConfigService, logoUpload } from '../services/system-config.service'

export const SystemConfigController = {
  // Logo上传中间件
  uploadLogoMiddleware: logoUpload.single('logo'),

  // 获取所有系统配置
  async getAll(req: Request, res: Response) {
    try {
      const configs = await SystemConfigService.getAll()
      res.json({ success: true, data: configs })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败',
      })
    }
  },

  // 获取系统Logo
  async getLogo(req: Request, res: Response) {
    try {
      const logo = await SystemConfigService.getLogo()
      res.json({ success: true, data: { logo } })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取Logo失败',
      })
    }
  },

  // 上传系统Logo
  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: '请选择图片文件' })
      }

      const logoPath = `/uploads/logos/${req.file.filename}`
      const result = await SystemConfigService.setLogo(logoPath)

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '上传Logo失败',
      })
    }
  },

  // 获取系统名称
  async getSystemName(req: Request, res: Response) {
    try {
      const name = await SystemConfigService.getSystemName()
      res.json({ success: true, data: { name } })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取系统名称失败',
      })
    }
  },

  // 设置系统名称
  async setSystemName(req: Request, res: Response) {
    try {
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ success: false, error: '请输入系统名称' })
      }

      const result = await SystemConfigService.setSystemName(name)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '设置系统名称失败',
      })
    }
  },

  // 获取公开配置（不需要认证）
  async getPublicConfig(req: Request, res: Response) {
    try {
      const [logo, name] = await Promise.all([
        SystemConfigService.getLogo(),
        SystemConfigService.getSystemName(),
      ])

      res.json({
        success: true,
        data: {
          logo,
          name,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败',
      })
    }
  },
}
