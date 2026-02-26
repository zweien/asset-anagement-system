import bcrypt from 'bcryptjs'
import { prisma } from '../lib/database'

// 用户角色枚举
export enum UserRole {
  ADMIN = 'ADMIN',    // 管理员 - 所有权限
  EDITOR = 'EDITOR',  // 录入员 - 资产CRUD、字段配置、导入导出、统计报表
  USER = 'USER',      // 普通用户 - 资产查看、数据报表、数据导出
}

// 有效的角色
const VALID_ROLES = Object.values(UserRole)

// 创建用户 DTO
export interface CreateUserDto {
  username: string
  password: string
  name?: string
  email?: string
  role?: string
}

// 更新用户 DTO
export interface UpdateUserDto {
  name?: string
  email?: string
  role?: string
  active?: boolean
}

// 更新密码 DTO
export interface UpdatePasswordDto {
  password: string
}

// 查询参数
export interface UserQueryParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  active?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户响应（不包含密码）
export interface UserResponse {
  id: string
  username: string
  name: string | null
  email: string | null
  role: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// 验证角色
function validateRole(role: string): boolean {
  return VALID_ROLES.includes(role as UserRole)
}

// 排除密码字段
function excludePassword(user: any): UserResponse {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

// 用户服务
export const UserService = {
  // 获取用户列表（分页）
  async getAll(params: UserQueryParams): Promise<PaginatedResult<UserResponse>> {
    const {
      page = 1,
      pageSize = 20,
      search,
      role,
      active,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params

    const where: any = {}

    // 搜索条件
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    // 角色筛选
    if (role) {
      where.role = role
    }

    // 状态筛选
    if (active !== undefined) {
      where.active = active
    }

    // 计算总数
    const total = await prisma.user.count({ where })
    const totalPages = Math.ceil(total / pageSize)

    // 查询数据
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      data: users.map(excludePassword),
      total,
      page,
      pageSize,
      totalPages,
    }
  },

  // 获取单个用户
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return excludePassword(user)
  },

  // 创建用户
  async create(data: CreateUserDto) {
    // 验证角色
    if (data.role && !validateRole(data.role)) {
      return {
        success: false,
        error: `无效的角色: ${data.role}，有效角色: ${VALID_ROLES.join(', ')}`,
      }
    }

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
        return { success: false, error: '邮箱已被使用' }
      }
    }

    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(data.password, 10)

      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          name: data.name,
          email: data.email || null,
          role: data.role || UserRole.USER,
        },
      })

      return { success: true, data: excludePassword(user) }
    } catch (error) {
      return { success: false, error: '创建用户失败' }
    }
  },

  // 更新用户信息
  async update(id: string, data: UpdateUserDto) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: '用户不存在' }
    }

    // 验证角色
    if (data.role && !validateRole(data.role)) {
      return {
        success: false,
        error: `无效的角色: ${data.role}，有效角色: ${VALID_ROLES.join(', ')}`,
      }
    }

    // 检查邮箱是否被其他用户使用
    if (data.email && data.email !== existing.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingEmail) {
        return { success: false, error: '邮箱已被使用' }
      }
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          // 空字符串转为 undefined，避免违反 unique 约束
          email: data.email || undefined,
          role: data.role,
          active: data.active,
        },
      })

      return { success: true, data: excludePassword(user) }
    } catch (error) {
      return { success: false, error: '更新用户失败' }
    }
  },

  // 更新用户角色
  async updateRole(id: string, role: string) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: '用户不存在' }
    }

    // 验证角色
    if (!validateRole(role)) {
      return {
        success: false,
        error: `无效的角色: ${role}，有效角色: ${VALID_ROLES.join(', ')}`,
      }
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
      })

      return { success: true, data: excludePassword(user) }
    } catch (error) {
      return { success: false, error: '更新角色失败' }
    }
  },

  // 更新用户状态（启用/禁用）
  async updateStatus(id: string, active: boolean) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: '用户不存在' }
    }

    // 防止禁用自己
    // 注意：这个检查应该在 controller 层进行，因为需要当前登录用户信息

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { active },
      })

      return {
        success: true,
        data: excludePassword(user),
        message: active ? '用户已启用' : '用户已禁用',
      }
    } catch (error) {
      return { success: false, error: '更新状态失败' }
    }
  },

  // 重置密码
  async resetPassword(id: string, newPassword: string) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: '用户不存在' }
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      })

      return { success: true, message: '密码重置成功' }
    } catch (error) {
      return { success: false, error: '密码重置失败' }
    }
  },

  // 删除用户
  async delete(id: string) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: '用户不存在' }
    }

    // 防止删除自己
    // 注意：这个检查应该在 controller 层进行

    try {
      await prisma.user.delete({
        where: { id },
      })

      return { success: true, message: '用户已删除' }
    } catch (error) {
      return { success: false, error: '删除用户失败' }
    }
  },
}
