import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// 配置Logo上传存储
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'logos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `system-logo${ext}`)
  }
})

export const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  }
})

export const SystemConfigService = {
  // 获取配置
  async get(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    })

    return config?.value || null
  },

  // 设置配置
  async set(key: string, value: string, description?: string) {
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    })

    return config
  },

  // 获取所有配置
  async getAll() {
    const configs = await prisma.systemConfig.findMany()
    return configs
  },

  // 获取系统Logo
  async getLogo() {
    const logo = await this.get('system_logo')
    return logo
  },

  // 设置系统Logo
  async setLogo(logoPath: string) {
    await this.set('system_logo', logoPath, '系统Logo')
    return { success: true, data: { logo: logoPath } }
  },

  // 获取系统名称
  async getSystemName() {
    const name = await this.get('system_name')
    return name || '资产管理系统'
  },

  // 设置系统名称
  async setSystemName(name: string) {
    await this.set('system_name', name, '系统名称')
    return { success: true, data: { name } }
  },

  // AI 配置相关
  async getAIConfig() {
    const apiTypeValue = await this.get('ai_api_type')
    const config = {
      apiKey: await this.get('ai_api_key') || process.env.DEEPSEEK_API_KEY || '',
      baseUrl: await this.get('ai_base_url') || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: await this.get('ai_model') || process.env.AI_MODEL || 'deepseek-chat',
      maxTokens: parseInt(await this.get('ai_max_tokens') || process.env.AI_MAX_TOKENS || '2000', 10),
      apiType: (apiTypeValue === 'responses' ? 'responses' : 'chat') as 'chat' | 'responses',
    }
    return config
  },

  async setAIConfig(data: {
    apiKey?: string
    baseUrl?: string
    model?: string
    maxTokens?: number
    apiType?: string
  }) {
    if (data.apiKey !== undefined) {
      await this.set('ai_api_key', data.apiKey, 'AI API Key')
    }
    if (data.baseUrl !== undefined) {
      await this.set('ai_base_url', data.baseUrl, 'AI Base URL')
    }
    if (data.model !== undefined) {
      await this.set('ai_model', data.model, 'AI 模型名称')
    }
    if (data.maxTokens !== undefined) {
      await this.set('ai_max_tokens', String(data.maxTokens), 'AI 最大 Token 数')
    }
    if (data.apiType !== undefined) {
      await this.set('ai_api_type', data.apiType, 'API 端点类型')
    }
    return { success: true, data: await this.getAIConfig() }
  },
}
