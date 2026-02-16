import { Request, Response } from 'express'
import { AuthService, LoginDto, RegisterDto } from '../services/auth.service'

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

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: '密码长度至少6位' })
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

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: '新密码长度至少6位' })
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
}
