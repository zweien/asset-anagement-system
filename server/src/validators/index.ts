import { z } from 'zod'
import { usernameSchema, passwordSchema, emailSchema, roleSchema, assetStatusSchema } from '../middleware/validation.middleware'

// ==================== 认证相关 ====================

export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  name: z.string().max(50, '姓名最多 50 个字符').optional(),
  email: emailSchema,
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: passwordSchema,
})

// ==================== 用户相关 ====================

export const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  name: z.string().max(50, '姓名最多 50 个字符').optional(),
  email: emailSchema,
  role: roleSchema.optional(),
})

export const updateUserSchema = z.object({
  name: z.string().max(50, '姓名最多 50 个字符').optional(),
  email: emailSchema,
  role: roleSchema.optional(),
})

export const updateRoleSchema = z.object({
  role: roleSchema,
})

export const updateStatusSchema = z.object({
  active: z.boolean(),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
})

// ==================== 资产相关 ====================

export const createAssetSchema = z.object({
  name: z.string().min(1, '资产名称不能为空').max(200, '资产名称最多 200 个字符'),
  code: z.string().max(50, '资产编号最多 50 个字符').optional(),
  categoryId: z.string().optional(),
  status: assetStatusSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const updateAssetSchema = z.object({
  name: z.string().min(1, '资产名称不能为空').max(200, '资产名称最多 200 个字符').optional(),
  code: z.string().max(50, '资产编号最多 50 个字符').optional(),
  categoryId: z.string().optional(),
  status: assetStatusSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const assetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  filters: z.string().optional(),
  groupBy: z.string().optional(),
})

export const batchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, '请选择要删除的资产'),
})

// ==================== 字段配置相关 ====================

export const fieldTypeSchema = z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT'], '无效的字段类型')

export const createFieldConfigSchema = z.object({
  name: z.string().min(1, '字段名称不能为空').max(50, '字段名称最多 50 个字符'),
  label: z.string().min(1, '字段标签不能为空').max(100, '字段标签最多 100 个字符'),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().max(100, '占位符最多 100 个字符').optional(),
  defaultValue: z.string().max(200, '默认值最多 200 个字符').optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const updateFieldConfigSchema = z.object({
  name: z.string().min(1, '字段名称不能为空').max(50, '字段名称最多 50 个字符').optional(),
  label: z.string().min(1, '字段标签不能为空').max(100, '字段标签最多 100 个字符').optional(),
  type: fieldTypeSchema.optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().max(100, '占位符最多 100 个字符').optional(),
  defaultValue: z.string().max(200, '默认值最多 200 个字符').optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

// ==================== 导入相关 ====================

export const importExecuteSchema = z.object({
  mappings: z.record(z.string(), z.string()),
  data: z.array(z.record(z.string(), z.unknown())),
})
