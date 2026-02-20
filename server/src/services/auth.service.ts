import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// 安全检查：生产环境不允许使用默认密钥
const DEFAULT_SECRETS = [
  'your-secret-key-change-in-production',
  'your-super-secret-jwt-key-change-in-production-min-32-chars',
]

if (process.env.NODE_ENV === 'production' && DEFAULT_SECRETS.includes(JWT_SECRET)) {
  console.error('❌ 安全错误: 生产环境必须设置自定义 JWT_SECRET 环境变量')
  process.exit(1)
}

// 密码复杂度验证
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 生成随机密码
function generateRandomPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const allChars = lowercase + uppercase + numbers

  let password = ''
  // 确保包含各类字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  password: string
  name?: string
  email?: string
}

export interface AuthUser {
  id: string
  username: string
  name: string | null
  email: string | null
  avatar: string | null
  role: string
}

export const AuthService = {
  // 用户登录
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (!user) {
      return { success: false, error: '用户名或密码错误' }
    }

    if (!user.active) {
      return { success: false, error: '账户已被禁用' }
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      return { success: false, error: '用户名或密码错误' }
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    }
  },

  // 用户注册
  async register(data: RegisterDto) {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (existingUser) {
      return { success: false, error: '用户名已存在' }
    }

    // 检查邮箱是否已存在
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingEmail) {
        return { success: false, error: '邮箱已被注册' }
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email,
        role: 'USER',
      },
    })

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    }
  },

  // 验证 Token
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user || !user.active) {
        return { success: false, error: '无效的用户' }
      }

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      }
    } catch (error) {
      return { success: false, error: '无效的 Token' }
    }
  },

  // 获取当前用户
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: '用户不存在' }
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    }
  },

  // 修改密码
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: '用户不存在' }
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password)
    if (!isValidPassword) {
      return { success: false, error: '原密码错误' }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { success: true, message: '密码修改成功' }
  },

  // 更新头像
  async updateAvatar(userId: string, avatarPath: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: '用户不存在' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    })

    return { success: true, message: '头像更新成功' }
  },

  // 创建默认管理员
  async createDefaultAdmin() {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!existingAdmin) {
      // 生成随机密码
      const randomPassword = generateRandomPassword(12)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: '管理员',
          role: 'ADMIN',
        },
      })
      console.log('===========================================')
      console.log('  默认管理员账户已创建')
      console.log('  用户名: admin')
      console.log(`  密码: ${randomPassword}`)
      console.log('  ⚠️  请登录后立即修改密码！')
      console.log('===========================================')
    }
  },
}
