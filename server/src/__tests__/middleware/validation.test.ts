import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { idSchema, paginationSchema, usernameSchema, passwordSchema, emailSchema, roleSchema } from '../../middleware/validation.middleware'

describe('Validation Middleware', () => {
  describe('validate 函数测试', () => {
    it('应该在验证成功时返回 true', () => {
      const schema = z.object({ name: z.string() })
      const result = schema.safeParse({ name: 'test' })
      expect(result.success).toBe(true)
    })

    it('应该在验证失败时返回 false', () => {
      const schema = z.object({ age: z.number() })
      const result = schema.safeParse({ age: 'not a number' })
      expect(result.success).toBe(false)
    })
  })

  describe('idSchema', () => {
    it('应该接受非空字符串', () => {
      const result = idSchema.safeParse('some-id')
      expect(result.success).toBe(true)
    })

    it('应该拒绝空字符串', () => {
      const result = idSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('paginationSchema', () => {
    it('应该提供默认值', () => {
      const result = paginationSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
    })

    it('应该解析字符串数字', () => {
      const result = paginationSchema.parse({ page: '2', pageSize: '50' })
      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(50)
    })

    it('应该限制 pageSize 最大值', () => {
      const result = paginationSchema.safeParse({ pageSize: 200 })
      expect(result.success).toBe(false)
    })
  })

  describe('usernameSchema', () => {
    it('应该接受有效的用户名', () => {
      expect(usernameSchema.safeParse('user123').success).toBe(true)
      expect(usernameSchema.safeParse('test_user').success).toBe(true)
      expect(usernameSchema.safeParse('ADMIN').success).toBe(true)
    })

    it('应该拒绝太短的用户名', () => {
      const result = usernameSchema.safeParse('ab')
      expect(result.success).toBe(false)
    })

    it('应该拒绝包含特殊字符的用户名', () => {
      const result = usernameSchema.safeParse('user@name')
      expect(result.success).toBe(false)
    })

    it('应该拒绝包含中文的用户名', () => {
      const result = usernameSchema.safeParse('用户名')
      expect(result.success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('应该接受有效的密码', () => {
      const result = passwordSchema.safeParse('Password123')
      expect(result.success).toBe(true)
    })

    it('应该拒绝太短的密码', () => {
      const result = passwordSchema.safeParse('Pass1')
      expect(result.success).toBe(false)
    })

    it('应该接受较长的密码', () => {
      const result = passwordSchema.safeParse('VeryLongPassword123!')
      expect(result.success).toBe(true)
    })
  })

  describe('emailSchema', () => {
    it('应该接受有效的邮箱', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('应该接受空字符串', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('应该接受 undefined', () => {
      const result = emailSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的邮箱', () => {
      const result = emailSchema.safeParse('not-an-email')
      expect(result.success).toBe(false)
    })
  })

  describe('roleSchema', () => {
    it('应该接受有效的角色', () => {
      expect(roleSchema.safeParse('ADMIN').success).toBe(true)
      expect(roleSchema.safeParse('EDITOR').success).toBe(true)
      expect(roleSchema.safeParse('USER').success).toBe(true)
    })

    it('应该拒绝无效的角色', () => {
      expect(roleSchema.safeParse('SUPERUSER').success).toBe(false)
      expect(roleSchema.safeParse('admin').success).toBe(false)
      expect(roleSchema.safeParse('').success).toBe(false)
    })
  })
})
