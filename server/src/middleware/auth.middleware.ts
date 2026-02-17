import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'

// 角色层级定义（数字越大权限越高）
const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 3,
  EDITOR: 2,
  USER: 1,
}

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
    const typedReq = req as Request & { userId?: string; user?: { id: string; role: string } }
    typedReq.userId = result.data.id
    typedReq.user = result.data

    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: '认证失败' })
  }
}

// 管理员权限中间件（仅管理员）
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: '需要管理员权限' })
  }

  next()
}

// 录入员及以上权限中间件（管理员、录入员）
export const editorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user || !['ADMIN', 'EDITOR'].includes(user.role)) {
    return res.status(403).json({ success: false, error: '需要录入员或管理员权限' })
  }

  next()
}

// 通用角色检查中间件（检查是否有足够的权限级别）
export const requireRole = (minRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    const userLevel = user ? ROLE_HIERARCHY[user.role] ?? 0 : 0
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0

    if (!user || userLevel < requiredLevel) {
      return res.status(403).json({ success: false, error: '权限不足' })
    }

    next()
  }
}

// 可选认证中间件（不强制要求登录）
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
      const result = await AuthService.verifyToken(token)
      if (result.success && result.data) {
        const typedReq = req as Request & { userId?: string; user?: { id: string; role: string } }
        typedReq.userId = result.data.id
        typedReq.user = result.data
      }
    }

    next()
  } catch (error) {
    // 忽略错误，继续执行
    next()
  }
}
