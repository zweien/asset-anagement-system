import { Request, Response } from 'express'
import { UserService, CreateUserDto, UpdateUserDto } from '../services/user.service'
import { LogService } from '../services/log.service'
import { validatePasswordStrength } from '../services/auth.service'
import * as XLSX from 'xlsx'

// 统一响应格式
const sendSuccess = <T>(res: Response, data: T, message?: string) => {
  res.json({ success: true, data, message })
}

const sendError = (res: Response, error: string, statusCode = 400) => {
  res.status(statusCode).json({ success: false, error })
}

// 获取操作者信息
const getOperatorInfo = (req: Request) => {
  const user = (req as any).user
  return {
    userId: user?.id,
    userName: user?.username || user?.name,
    ip: req.ip || req.headers['x-forwarded-for'] as string,
    userAgent: req.headers['user-agent'],
  }
}

// 用户控制器
export const UserController = {
  // GET /api/users - 获取用户列表（仅管理员）
  async getAll(req: Request, res: Response) {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 20, 100),
        search: req.query.search as string,
        role: req.query.role as string,
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      }

      const result = await UserService.getAll(params)
      sendSuccess(res, result)
    } catch (error) {
      sendError(res, '获取用户列表失败', 500)
    }
  },

  // GET /api/users/:id - 获取单个用户
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = await UserService.getById(id)

      if (!user) {
        return sendError(res, '用户不存在', 404)
      }

      sendSuccess(res, user)
    } catch (error) {
      sendError(res, '获取用户信息失败', 500)
    }
  },

  // POST /api/users - 创建用户
  async create(req: Request, res: Response) {
    try {
      const data: CreateUserDto = req.body

      // 基本验证
      if (!data.username) {
        return sendError(res, '用户名为必填字段')
      }
      if (!data.password) {
        return sendError(res, '密码为必填字段')
      }

      // 密码复杂度验证
      const passwordValidation = validatePasswordStrength(data.password)
      if (!passwordValidation.valid) {
        return sendError(res, `密码不符合要求: ${passwordValidation.errors.join(', ')}`)
      }

      const result = await UserService.create(data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'CREATE',
        entityType: 'User',
        entityId: result.data!.id,
        userId: operator.userId,
        userName: operator.userName,
        newValue: {
          username: result.data!.username,
          name: result.data!.name,
          email: result.data!.email,
          role: result.data!.role,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, result.data, '用户创建成功')
    } catch (error) {
      sendError(res, '创建用户失败', 500)
    }
  },

  // PUT /api/users/:id - 更新用户信息
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data: UpdateUserDto = req.body
      const currentUserId = (req as any).userId

      // 防止修改自己的状态（防止管理员意外禁用自己）
      if (id === currentUserId && data.active === false) {
        return sendError(res, '不能禁用自己的账户', 400)
      }

      // 获取更新前的用户信息用于日志记录
      const oldUser = await UserService.getById(id)
      if (!oldUser) {
        return sendError(res, '用户不存在', 404)
      }

      const result = await UserService.update(id, data)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: operator.userId,
        userName: operator.userName,
        oldValue: {
          name: oldUser.name,
          email: oldUser.email,
          role: oldUser.role,
        },
        newValue: {
          name: result.data!.name,
          email: result.data!.email,
          role: result.data!.role,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, result.data, '用户更新成功')
    } catch (error) {
      sendError(res, '更新用户失败', 500)
    }
  },

  // PUT /api/users/:id/role - 更新用户角色
  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { role } = req.body
      const currentUserId = (req as any).userId

      if (!role) {
        return sendError(res, '角色为必填字段')
      }

      // 防止修改自己的角色
      if (id === currentUserId) {
        return sendError(res, '不能修改自己的角色', 400)
      }

      // 获取更新前的用户信息用于日志记录
      const oldUser = await UserService.getById(id)
      if (!oldUser) {
        return sendError(res, '用户不存在', 404)
      }

      const result = await UserService.updateRole(id, role)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: operator.userId,
        userName: operator.userName,
        oldValue: {
          username: oldUser.username,
          role: oldUser.role,
        },
        newValue: {
          username: result.data!.username,
          role: result.data!.role,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, result.data, '角色更新成功')
    } catch (error) {
      sendError(res, '更新角色失败', 500)
    }
  },

  // PUT /api/users/:id/status - 更新用户状态（启用/禁用）
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { active } = req.body
      const currentUserId = (req as any).userId

      if (active === undefined) {
        return sendError(res, '状态为必填字段')
      }

      // 防止禁用自己
      if (id === currentUserId && active === false) {
        return sendError(res, '不能禁用自己的账户', 400)
      }

      // 获取更新前的用户信息用于日志记录
      const oldUser = await UserService.getById(id)
      if (!oldUser) {
        return sendError(res, '用户不存在', 404)
      }

      const result = await UserService.updateStatus(id, active)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: operator.userId,
        userName: operator.userName,
        oldValue: {
          username: oldUser.username,
          active: oldUser.active,
        },
        newValue: {
          username: result.data!.username,
          active: result.data!.active,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, result.data, result.message)
    } catch (error) {
      sendError(res, '更新状态失败', 500)
    }
  },

  // PUT /api/users/:id/password - 重置用户密码
  async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { password } = req.body

      if (!password) {
        return sendError(res, '密码为必填字段')
      }

      // 密码复杂度验证
      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.valid) {
        return sendError(res, `密码不符合要求: ${passwordValidation.errors.join(', ')}`)
      }

      // 获取用户信息用于日志记录
      const user = await UserService.getById(id)
      if (!user) {
        return sendError(res, '用户不存在', 404)
      }

      const result = await UserService.resetPassword(id, password)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: operator.userId,
        userName: operator.userName,
        newValue: {
          username: user.username,
          action: '重置密码',
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, null, result.message)
    } catch (error) {
      sendError(res, '重置密码失败', 500)
    }
  },

  // DELETE /api/users/:id - 删除用户
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const currentUserId = (req as any).userId

      // 防止删除自己
      if (id === currentUserId) {
        return sendError(res, '不能删除自己的账户', 400)
      }

      // 获取删除前的用户信息用于日志记录
      const oldUser = await UserService.getById(id)
      if (!oldUser) {
        return sendError(res, '用户不存在', 404)
      }

      const result = await UserService.delete(id)

      if (!result.success) {
        return sendError(res, result.error!)
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        userId: operator.userId,
        userName: operator.userName,
        oldValue: {
          username: oldUser.username,
          name: oldUser.name,
          email: oldUser.email,
          role: oldUser.role,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, null, result.message)
    } catch (error) {
      sendError(res, '删除用户失败', 500)
    }
  },

  // GET /api/users/template - 下载用户导入模板
  async downloadTemplate(req: Request, res: Response) {
    try {
      // 创建工作簿
      const workbook = XLSX.utils.book_new()

      // 定义模板数据
      const templateData = [
        ['用户名*', '姓名', '邮箱', '角色*', '密码*'],
        ['zhangsan', '张三', 'zhangsan@example.com', 'USER', 'Password123'],
        ['lisi', '李四', 'lisi@example.com', 'EDITOR', 'Password123'],
        ['wangwu', '王五', '', 'USER', 'Password123'],
      ]

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(templateData)

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 15 }, // 用户名
        { wch: 15 }, // 姓名
        { wch: 25 }, // 邮箱
        { wch: 10 }, // 角色
        { wch: 15 }, // 密码
      ]

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户导入模板')

      // 生成 Excel 文件
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx')

      res.send(buffer)
    } catch (error) {
      sendError(res, '生成模板失败', 500)
    }
  },

  // POST /api/users/import - 批量导入用户
  async importUsers(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, '请上传 Excel 文件')
      }

      // 解析 Excel 文件
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

      if (data.length < 2) {
        return sendError(res, 'Excel 文件为空或格式不正确')
      }

      // 跳过标题行
      const rows = data.slice(1)
      const results = {
        success: 0,
        failed: 0,
        errors: [] as { row: number; username?: string; error: string }[],
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Excel 行号（从 2 开始，1 是标题行）

        // 解析行数据
        const username = row[0]?.toString().trim()
        const name = row[1]?.toString().trim() || ''
        const email = row[2]?.toString().trim() || undefined
        const role = row[3]?.toString().trim().toUpperCase() || 'USER'
        const password = row[4]?.toString().trim()

        // 验证必填字段
        if (!username) {
          results.failed++
          results.errors.push({ row: rowNum, error: '用户名不能为空' })
          continue
        }

        if (!password) {
          results.failed++
          results.errors.push({ row: rowNum, username, error: '密码不能为空' })
          continue
        }

        // 验证角色
        const validRoles = ['ADMIN', 'EDITOR', 'USER']
        if (!validRoles.includes(role)) {
          results.failed++
          results.errors.push({ row: rowNum, username, error: `无效的角色: ${role}，有效角色: ${validRoles.join(', ')}` })
          continue
        }

        // 验证密码复杂度
        const passwordValidation = validatePasswordStrength(password)
        if (!passwordValidation.valid) {
          results.failed++
          results.errors.push({ row: rowNum, username, error: `密码不符合要求: ${passwordValidation.errors.join(', ')}` })
          continue
        }

        // 创建用户
        const result = await UserService.create({
          username,
          password,
          name: name || undefined,
          email,
          role,
        })

        if (result.success) {
          results.success++
        } else {
          results.failed++
          results.errors.push({ row: rowNum, username, error: result.error || '创建失败' })
        }
      }

      // 记录操作日志
      const operator = getOperatorInfo(req)
      await LogService.create({
        action: 'IMPORT',
        entityType: 'User',
        userId: operator.userId,
        userName: operator.userName,
        newValue: {
          成功数量: results.success,
          失败数量: results.failed,
          总数量: rows.length,
        },
        ip: operator.ip,
        userAgent: operator.userAgent,
      })

      sendSuccess(res, results, `导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`)
    } catch (error) {
      console.error('导入用户失败:', error)
      sendError(res, '导入用户失败', 500)
    }
  },
}
