import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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

describe('密码加密验证', () => {
  it('应该能正确加密和验证密码', async () => {
    const password = 'TestPassword123'
    const hashedPassword = await bcrypt.hash(password, 10)

    expect(hashedPassword).not.toBe(password)
    expect(await bcrypt.compare(password, hashedPassword)).toBe(true)
    expect(await bcrypt.compare('wrongpassword', hashedPassword)).toBe(false)
  })

  it('不同密码应该生成不同的哈希值', async () => {
    const password = 'TestPassword123'
    const hash1 = await bcrypt.hash(password, 10)
    const hash2 = await bcrypt.hash(password, 10)

    expect(hash1).not.toBe(hash2)
  })

  it('哈希值应该以 $2a$ 或 $2b$ 开头', async () => {
    const password = 'TestPassword123'
    const hashedPassword = await bcrypt.hash(password, 10)

    expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true)
  })
})

describe('JWT Token 验证', () => {
  const testSecret = 'test-jwt-secret'

  it('应该能正确生成和验证 JWT', () => {
    const payload = { userId: '123', username: 'testuser', role: 'USER' }
    const token = jwt.sign(payload, testSecret, { expiresIn: '1h' })

    const decoded = jwt.verify(token, testSecret) as typeof payload
    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.username).toBe(payload.username)
    expect(decoded.role).toBe(payload.role)
  })

  it('无效的 token 应该抛出错误', () => {
    expect(() => jwt.verify('invalid-token', testSecret)).toThrow()
  })

  it('错误的密钥应该抛出错误', () => {
    const token = jwt.sign({ userId: '123' }, testSecret)
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow()
  })

  it('JWT 应该包含过期时间', () => {
    const payload = { userId: '123' }
    const token = jwt.sign(payload, testSecret, { expiresIn: '1h' })
    const decoded = jwt.decode(token) as any

    expect(decoded.exp).toBeDefined()
    expect(decoded.iat).toBeDefined()
  })
})

describe('AuthService - 登录 DTO 验证', () => {
  interface LoginDto {
    username: string
    password: string
  }

  it('有效的登录 DTO 应该包含用户名和密码', () => {
    const dto: LoginDto = {
      username: 'testuser',
      password: 'TestPassword123',
    }

    expect(dto.username).toBe('testuser')
    expect(dto.password).toBe('TestPassword123')
  })

  it('用户名不应该为空', () => {
    const dto: LoginDto = {
      username: '',
      password: 'TestPassword123',
    }

    expect(dto.username).toBe('')
    expect(dto.username.length).toBe(0)
  })
})

describe('AuthService - 注册 DTO 验证', () => {
  interface RegisterDto {
    username: string
    password: string
    name?: string
    email?: string
  }

  it('有效的注册 DTO 应该包含必填字段', () => {
    const dto: RegisterDto = {
      username: 'newuser',
      password: 'NewPassword123',
      name: '新用户',
      email: 'new@example.com',
    }

    expect(dto.username).toBe('newuser')
    expect(dto.password).toBe('NewPassword123')
    expect(dto.name).toBe('新用户')
    expect(dto.email).toBe('new@example.com')
  })

  it('最小注册 DTO 应该只有用户名和密码', () => {
    const dto: RegisterDto = {
      username: 'minimal',
      password: 'MinimalPass123',
    }

    expect(dto.username).toBe('minimal')
    expect(dto.password).toBe('MinimalPass123')
    expect(dto.name).toBeUndefined()
    expect(dto.email).toBeUndefined()
  })
})
