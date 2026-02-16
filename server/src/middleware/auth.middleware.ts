import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'

// 认证中间件
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const result = await AuthService.verifyToken(token)

    if (!result.success || !result.data) {
      return res.status(401).json({ success: false, error: result.error || '无效的 Token' })
    }

    // 将用户信息附加到请求对象
    ;(req as any).userId = result.data.id
    ;(req as any).user = result.data

    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: '认证失败' })
  }
}

// 管理员权限中间件
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: '需要管理员权限' })
  }

  next()
}

// 可选认证中间件（不强制要求登录）
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
      const result = await AuthService.verifyToken(token)
      if (result.success && result.data) {
        ;(req as any).userId = result.data.id
        ;(req as any).user = result.data
      }
    }

    next()
  } catch (error) {
    // 忽略错误，继续执行
    next()
  }
}
