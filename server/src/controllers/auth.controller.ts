import { Request, Response } from 'express'
import { AuthService, LoginDto, RegisterDto, validatePasswordStrength } from '../services/auth.service'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 配置头像上传存储
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const userId = (req as any).userId
    const ext = path.extname(file.originalname)
    cb(null, `${userId}${ext}`)
  }
})

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  }
})

export const AuthController = {
  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body as LoginDto

      if (!username || !password) {
        return res.status(400).json({ success: false, error: '请输入用户名和密码' })
      }

      const result = await AuthService.login({ username, password })

      if (result.success) {
        res.json(result)
      } else {
        res.status(401).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      })
    }
  },

  // 用户注册
  async register(req: Request, res: Response) {
    try {
      const { username, password, name, email } = req.body as RegisterDto

      if (!username || !password) {
        return res.status(400).json({ success: false, error: '请输入用户名和密码' })
      }

      // 密码复杂度验证
      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `密码不符合要求: ${passwordValidation.errors.join(', ')}`
        })
      }

      const result = await AuthService.register({ username, password, name, email })

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '注册失败',
      })
    }
  },

  // 获取当前用户
  async getCurrentUser(req: Request, res: Response) {
    try {
      // 从中间件获取用户ID
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const result = await AuthService.getCurrentUser(userId)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取用户信息失败',
      })
    }
  },

  // 修改密码
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const { oldPassword, newPassword } = req.body

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, error: '请输入原密码和新密码' })
      }

      // 密码复杂度验证
      const passwordValidation = validatePasswordStrength(newPassword)
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `密码不符合要求: ${passwordValidation.errors.join(', ')}`
        })
      }

      const result = await AuthService.changePassword(userId, oldPassword, newPassword)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '修改密码失败',
      })
    }
  },

  // 验证 Token
  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

      if (!token) {
        return res.status(401).json({ success: false, error: '未提供 Token' })
      }

      const result = await AuthService.verifyToken(token)

      if (result.success) {
        res.json(result)
      } else {
        res.status(401).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '验证失败',
      })
    }
  },

  // 上传头像
  uploadAvatarMiddleware: avatarUpload.single('avatar'),

  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: '请选择图片文件' })
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`

      const result = await AuthService.updateAvatar(userId, avatarPath)

      if (result.success) {
        res.json({ success: true, data: { avatar: avatarPath } })
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '上传头像失败',
      })
    }
  },
}
