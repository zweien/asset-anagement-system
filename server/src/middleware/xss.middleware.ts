import { Request, Response, NextFunction } from 'express'
import { sanitizeObject, sanitizeDynamicData } from '../utils/sanitize'

/**
 * XSS 清理中间件
 * 自动清理请求体中的潜在 XSS 攻击代码
 */
export function xssSanitize(req: Request, res: Response, next: NextFunction) {
  // 清理请求体
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)

    // 如果存在动态字段数据，额外清理
    if (req.body.data) {
      req.body.data = sanitizeDynamicData(req.body.data)
    }
  }

  // 清理查询参数
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }

  next()
}

/**
 * 严格 XSS 清理中间件
 * 用于需要更严格验证的端点
 */
export function xssSanitizeStrict(req: Request, res: Response, next: NextFunction) {
  // 先执行基础清理
  xssSanitize(req, res, () => {})

  // 额外检查请求体中的动态字段
  if (req.body?.data && typeof req.body.data === 'object') {
    for (const [key, value] of Object.entries(req.body.data)) {
      // 确保所有字符串值都被清理
      if (typeof value === 'string') {
        req.body.data[key] = sanitizeObject(value)
      }
    }
  }

  next()
}
