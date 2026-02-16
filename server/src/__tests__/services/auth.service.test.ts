import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from '../../services/auth.service'

describe('AuthService - 密码验证', () => {
  describe('validatePasswordStrength', () => {
    it('应该拒绝少于8位的密码', () => {
      const result = validatePasswordStrength('Abc123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码长度至少8位')
    })

    it('应该拒绝没有小写字母的密码', () => {
      const result = validatePasswordStrength('ABC12345')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含小写字母')
    })

    it('应该拒绝没有大写字母的密码', () => {
      const result = validatePasswordStrength('abc12345')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含大写字母')
    })

    it('应该拒绝没有数字的密码', () => {
      const result = validatePasswordStrength('Abcdefgh')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含数字')
    })

    it('应该接受有效的密码', () => {
      const result = validatePasswordStrength('Abcdefg123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该接受包含特殊字符的密码', () => {
      const result = validatePasswordStrength('Abcdefg123!@#')
      expect(result.valid).toBe(true)
    })

    it('应该同时返回多个错误', () => {
      const result = validatePasswordStrength('abc')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})
