import xss from 'xss'

/**
 * XSS 清理配置
 * 自定义允许的 HTML 标签和属性
 */
const xssOptions = {
  whiteList: {}, // 不允许任何 HTML 标签
  stripIgnoreTag: true, // 过滤所有非白名单标签
  stripIgnoreTagBody: ['script', 'style'], // 过滤 script 和 style 标签内容
}

/**
 * 清理字符串中的 XSS 攻击代码
 * @param input - 要清理的字符串
 * @returns 清理后的安全字符串
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input
  return xss(input, xssOptions)
}

/**
 * 递归清理对象中的所有字符串值
 * @param obj - 要清理的对象
 * @returns 清理后的对象
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj

  if (typeof obj === 'string') {
    return sanitizeString(obj) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // 清理 key（防止属性名注入）
      const cleanKey = sanitizeString(key)
      sanitized[cleanKey] = sanitizeObject(value)
    }
    return sanitized as T
  }

  return obj
}

/**
 * 清理动态字段数据
 * 专门用于资产的 data 字段
 */
export function sanitizeDynamicData(data: Record<string, unknown>): Record<string, unknown> {
  if (!data || typeof data !== 'object') return data

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const cleanKey = sanitizeString(key)

    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else {
      sanitized[cleanKey] = value
    }
  }

  return sanitized
}

/**
 * 检查字符串是否包含潜在的 XSS 攻击代码
 * @param input - 要检查的字符串
 * @returns 是否包含危险内容
 */
export function containsXSS(input: string): boolean {
  if (typeof input !== 'string') return false

  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onload=, etc.
    /data:\s*text\/html/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
  ]

  return dangerousPatterns.some(pattern => pattern.test(input))
}

/**
 * 转义 HTML 特殊字符
 * 用于在 HTML 上下文中显示用户输入
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return input

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return input.replace(/[&<>"'/]/g, char => htmlEntities[char])
}
