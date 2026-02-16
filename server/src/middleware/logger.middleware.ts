import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

// 请求日志中间件
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  // 响应完成后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start
    const { method, originalUrl, ip } = req
    const { statusCode } = res

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`

    // 根据状态码选择日志级别
    if (statusCode >= 500) {
      logger.error(message, { ip, method, url: originalUrl, status: statusCode, duration })
    } else if (statusCode >= 400) {
      logger.warn(message, { ip, method, url: originalUrl, status: statusCode, duration })
    } else {
      logger.http(message, { ip, method, url: originalUrl, status: statusCode, duration })
    }
  })

  next()
}

// 错误日志中间件
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl, ip } = req

  logger.error(`${method} ${originalUrl} - Error: ${err.message}`, {
    ip,
    method,
    url: originalUrl,
    error: err.message,
    stack: err.stack,
  })

  next(err)
}

// API 调用日志（用于记录重要业务操作）
export function logApiCall(
  action: string,
  userId: string | null,
  details: Record<string, unknown>
) {
  logger.info(`API: ${action}`, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  })
}
