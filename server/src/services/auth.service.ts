import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

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

  // 创建默认管理员
  async createDefaultAdmin() {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: '管理员',
          role: 'ADMIN',
        },
      })
      console.log('默认管理员账户已创建: admin / admin123')
    }
  },
}
