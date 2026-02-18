import { Request, Response, NextFunction } from 'express'

// 限流配置
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '20', 10)
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '100', 10)
const WINDOW_MS = 60 * 1000 // 1分钟

// 用户限流状态
interface UserRateLimit {
  minuteCount: number
  minuteResetAt: number
  dailyCount: number
  dailyResetAt: number
}

// 内存存储限流状态
const rateLimitStore = new Map<string, UserRateLimit>()

// 清理过期的限流记录（每小时执行一次）
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.dailyResetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000)

// AI 限流中间件
export const aiRateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user || !user.id) {
    return res.status(401).json({ success: false, error: '未登录' })
  }

  const userId = user.id
  const now = Date.now()

  // 获取或初始化用户限流状态
  let userLimit = rateLimitStore.get(userId)

  if (!userLimit) {
    userLimit = {
      minuteCount: 0,
      minuteResetAt: now + WINDOW_MS,
      dailyCount: 0,
      dailyResetAt: getTomorrowMidnight(),
    }
    rateLimitStore.set(userId, userLimit)
  }

  // 检查分钟限流
  if (now > userLimit.minuteResetAt) {
    userLimit.minuteCount = 0
    userLimit.minuteResetAt = now + WINDOW_MS
  }

  if (userLimit.minuteCount >= RATE_LIMIT_MAX_REQUESTS) {
    const resetIn = Math.ceil((userLimit.minuteResetAt - now) / 1000)
    return res.status(429).json({
      success: false,
      error: `请求过于频繁，请在 ${resetIn} 秒后重试`,
      retryAfter: resetIn,
    })
  }

  // 检查每日限额
  if (now > userLimit.dailyResetAt) {
    userLimit.dailyCount = 0
    userLimit.dailyResetAt = getTomorrowMidnight()
  }

  if (userLimit.dailyCount >= DAILY_LIMIT) {
    return res.status(429).json({
      success: false,
      error: '今日 AI 助手使用次数已达上限，请明天再试',
    })
  }

  // 增加计数
  userLimit.minuteCount++
  userLimit.dailyCount++

  next()
}

// 获取明天零点的时间戳
function getTomorrowMidnight(): number {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

// 获取用户当前限流状态（用于 API 返回）
export function getUserRateLimitStatus(userId: string): {
  minuteRemaining: number
  dailyRemaining: number
} {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)

  if (!userLimit) {
    return {
      minuteRemaining: RATE_LIMIT_MAX_REQUESTS,
      dailyRemaining: DAILY_LIMIT,
    }
  }

  let minuteRemaining = RATE_LIMIT_MAX_REQUESTS - userLimit.minuteCount
  let dailyRemaining = DAILY_LIMIT - userLimit.dailyCount

  // 如果分钟窗口已重置
  if (now > userLimit.minuteResetAt) {
    minuteRemaining = RATE_LIMIT_MAX_REQUESTS
  }

  // 如果每日窗口已重置
  if (now > userLimit.dailyResetAt) {
    dailyRemaining = DAILY_LIMIT
  }

  return {
    minuteRemaining: Math.max(0, minuteRemaining),
    dailyRemaining: Math.max(0, dailyRemaining),
  }
}
