import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

/**
 * 验证中间件工厂函数
 * @param schema - Zod 验证 schema
 * @param source - 验证数据来源 (body, params, query)
 */
export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source]
      const result = schema.parse(data)
      // 将验证后的数据替换原始数据
      req[source] = result
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: errors,
        })
      }
      next(error)
    }
  }
}

/**
 * 组合多个验证中间件
 */
export function validateAll(validations: Array<{ schema: ZodSchema; source: 'body' | 'params' | 'query' }>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const { schema, source } of validations) {
        const data = req[source]
        const result = schema.parse(data)
        req[source] = result
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: errors,
        })
      }
      next(error)
    }
  }
}

// 常用验证 schema
import { z } from 'zod'

// ID 验证 (cuid 格式)
export const idSchema = z.string().min(1, 'ID 不能为空')

// 分页参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// 用户名验证
export const usernameSchema = z
  .string()
  .min(3, '用户名至少 3 个字符')
  .max(50, '用户名最多 50 个字符')
  .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')

// 密码验证 (基础)
export const passwordSchema = z
  .string()
  .min(8, '密码至少 8 个字符')
  .max(100, '密码最多 100 个字符')

// 邮箱验证
export const emailSchema = z
  .string()
  .email('邮箱格式不正确')
  .max(100, '邮箱最多 100 个字符')
  .optional()
  .or(z.literal(''))

// 角色验证
export const roleSchema = z.enum(['ADMIN', 'EDITOR', 'USER'], '无效的角色类型')

// 资产状态验证
export const assetStatusSchema = z.enum(['ACTIVE', 'IDLE', 'DAMAGED', 'SCRAPPED'], '无效的资产状态')

// 日期字符串验证
export const dateStringSchema = z
  .string()
  .datetime({ message: '日期格式不正确' })
  .optional()
  .or(z.literal(''))
