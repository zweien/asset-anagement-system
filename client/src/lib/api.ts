import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401 错误时清除登录状态
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 如果不是登录页面，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const message = error.response?.data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default api

// 字段配置类型
export interface FieldConfig {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  isSystem: boolean
  visible: boolean
  options: string | null
  defaultValue: string | null
  validation: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'TEXTAREA'

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: '单行文本' },
  { value: 'TEXTAREA', label: '多行文本' },
  { value: 'NUMBER', label: '数字' },
  { value: 'DATE', label: '日期' },
  { value: 'SELECT', label: '下拉单选' },
  { value: 'MULTISELECT', label: '多选' },
]

// 创建字段 DTO
export interface CreateFieldDto {
  name: string
  label: string
  type: FieldType
  required?: boolean
  isSystem?: boolean
  visible?: boolean
  options?: string
  defaultValue?: string
  validation?: string
}

// 更新字段 DTO
export interface UpdateFieldDto {
  name?: string
  label?: string
  type?: FieldType
  required?: boolean
  isSystem?: boolean
  visible?: boolean
  options?: string
  defaultValue?: string
  validation?: string
  order?: number
}

// 字段配置 API
export const fieldApi = {
  // 获取所有字段
  getAll: () => api.get<{ success: boolean; data: FieldConfig[] }>('/fields'),

  // 获取单个字段
  getById: (id: string) => api.get<{ success: boolean; data: FieldConfig }>(`/fields/${id}`),

  // 创建字段
  create: (data: CreateFieldDto) => api.post<{ success: boolean; data: FieldConfig; message: string }>('/fields', data),

  // 更新字段
  update: (id: string, data: UpdateFieldDto) => api.put<{ success: boolean; data: FieldConfig; message: string }>(`/fields/${id}`, data),

  // 删除字段
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/fields/${id}`),

  // 重新排序
  reorder: (orders: { id: string; order: number }[]) =>
    api.put<{ success: boolean; message: string }>('/fields/reorder', { orders }),
}

// ============ 资产相关类型 ============

export type AssetStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'SCRAPPED'

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  ACTIVE: '在用',
  IDLE: '闲置',
  MAINTENANCE: '维修',
  SCRAPPED: '报废',
}

export interface Asset {
  id: string
  name: string
  code: string | null
  categoryId: string | null
  status: AssetStatus
  data: string // JSON 字符串
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  category?: { id: string; name: string } | null
  images?: { id: string; filename: string; path: string }[]
}

export interface CreateAssetDto {
  name: string
  code?: string
  categoryId?: string
  status?: AssetStatus
  data?: Record<string, unknown>
}

export interface UpdateAssetDto {
  name?: string
  code?: string
  categoryId?: string
  status?: AssetStatus
  data?: Record<string, unknown>
}

export interface AssetQueryParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: string // JSON 字符串，包含字段筛选条件
}

export interface PaginatedAssets {
  data: Asset[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 资产 API
export const assetApi = {
  // 获取资产列表
  getAll: (params?: AssetQueryParams) =>
    api.get<{ success: boolean; data: PaginatedAssets }>('/assets', { params }),

  // 获取单个资产
  getById: (id: string) =>
    api.get<{ success: boolean; data: Asset }>(`/assets/${id}`),

  // 创建资产
  create: (data: CreateAssetDto) =>
    api.post<{ success: boolean; data: Asset; message: string }>('/assets', data),

  // 更新资产
  update: (id: string, data: UpdateAssetDto) =>
    api.put<{ success: boolean; data: Asset; message: string }>(`/assets/${id}`, data),

  // 删除资产
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/assets/${id}`),

  // 批量删除
  batchDelete: (ids: string[]) =>
    api.post<{ success: boolean; data: { count: number }; message: string }>('/assets/batch-delete', { ids }),

  // 分组查询
  getGrouped: (groupBy: string, pageSize?: number) =>
    api.get<{ success: boolean; data: GroupedAssets }>('/assets/grouped', {
      params: { groupBy, pageSize },
    }),
}

// 分组数据
export interface GroupedAssets {
  groups: {
    key: string
    label: string
    count: number
    assets: Asset[]
  }[]
  total: number
  groupBy: string
}

// ============ 日志相关类型 ============

export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'LOGIN' | 'LOGOUT'

export const LOG_ACTION_LABELS: Record<LogAction, string> = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  IMPORT: '导入',
  EXPORT: '导出',
  LOGIN: '登录',
  LOGOUT: '登出',
}

export interface OperationLog {
  id: string
  action: LogAction
  entityType: string
  entityId: string | null
  userId: string | null
  userName: string | null
  oldValue: string | null
  newValue: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
}

export interface LogQueryParams {
  page?: number
  pageSize?: number
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export interface PaginatedLogs {
  data: OperationLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LogStats {
  total: number
  byAction: { action: string; count: number }[]
  byEntityType: { entityType: string; count: number }[]
}

// 日志 API
export const logApi = {
  // 获取日志列表
  getAll: (params?: LogQueryParams) =>
    api.get<{ success: boolean; data: PaginatedLogs }>('/logs', { params }),

  // 获取单个日志
  getById: (id: string) =>
    api.get<{ success: boolean; data: OperationLog }>(`/logs/${id}`),

  // 获取统计
  getStats: () =>
    api.get<{ success: boolean; data: LogStats }>('/logs/stats'),
}

// ============ 数据库导入相关类型 ============

export interface DBConnectionConfig {
  type: 'mysql' | 'postgresql'
  host: string
  port: number
  database: string
  username: string
  password: string
}

export interface TableInfo {
  name: string
  columns: ColumnInfo[]
  rowCount?: number
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
}

export interface DBFieldMapping {
  sourceColumn: string
  targetField: string
}

// 数据库导入 API
export const dbImportApi = {
  // 测试连接
  testConnection: (config: DBConnectionConfig) =>
    api.post<{ success: boolean; message?: string; error?: string }>('/db-import/test-connection', config),

  // 获取表列表
  getTables: (config: DBConnectionConfig) =>
    api.post<{ success: boolean; data?: TableInfo[]; error?: string }>('/db-import/tables', config),

  // 预览数据
  previewData: (config: DBConnectionConfig, tableName: string) =>
    api.post<{ success: boolean; data?: Record<string, any>[]; error?: string }>('/db-import/preview', {
      config,
      tableName,
    }),

  // 执行导入
  importData: (config: DBConnectionConfig, tableName: string, mapping: DBFieldMapping[]) =>
    api.post<{ success: boolean; data?: { total: number; imported: number; failed: number; errors: string[] }; error?: string }>('/db-import/execute', {
      config,
      tableName,
      mapping,
    }),
}

// ============ 报表模板相关类型 ============

export type ChartType = 'bar' | 'pie' | 'line'

export interface ReportTemplate {
  id: string
  name: string
  description: string | null
  chartType: ChartType
  dimension: string
  filters: string | null
  dateRange: string | null
  customStartDate: string | null
  customEndDate: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateReportTemplateDto {
  name: string
  description?: string
  chartType: ChartType
  dimension: string
  filters?: string
  dateRange?: string
  customStartDate?: string
  customEndDate?: string
  isDefault?: boolean
}

export interface UpdateReportTemplateDto {
  name?: string
  description?: string
  chartType?: ChartType
  dimension?: string
  filters?: string
  dateRange?: string
  customStartDate?: string
  customEndDate?: string
  isDefault?: boolean
}

export interface ReportDataItem {
  label: string
  count: number
  value: number
}

export interface ReportQueryParams {
  dimension: string
  chartType?: ChartType
  filters?: string
  dateRange?: string
  customStartDate?: string
  customEndDate?: string
}

// 报表 API
export const reportApi = {
  // 获取所有报表模板
  getTemplates: () =>
    api.get<{ success: boolean; data: ReportTemplate[] }>('/reports/templates'),

  // 获取单个报表模板
  getTemplate: (id: string) =>
    api.get<{ success: boolean; data: ReportTemplate }>(`/reports/templates/${id}`),

  // 创建报表模板
  createTemplate: (data: CreateReportTemplateDto) =>
    api.post<{ success: boolean; data: ReportTemplate; message: string }>('/reports/templates', data),

  // 更新报表模板
  updateTemplate: (id: string, data: UpdateReportTemplateDto) =>
    api.put<{ success: boolean; data: ReportTemplate; message: string }>(`/reports/templates/${id}`, data),

  // 删除报表模板
  deleteTemplate: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reports/templates/${id}`),

  // 获取报表数据
  getData: (params: ReportQueryParams) =>
    api.get<{ success: boolean; data: ReportDataItem[] }>('/reports/data', { params }),
}

// ============ 认证相关类型 ============

export interface User {
  id: string
  username: string
  name: string | null
  email: string | null
  role: string
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

export interface AuthResponse {
  token: string
  user: User
}

// 认证 API
export const authApi = {
  // 登录
  login: (data: LoginDto) =>
    api.post<{ success: boolean; data?: AuthResponse; error?: string }>('/auth/login', data),

  // 注册
  register: (data: RegisterDto) =>
    api.post<{ success: boolean; data?: AuthResponse; error?: string }>('/auth/register', data),

  // 获取当前用户
  getCurrentUser: () =>
    api.get<{ success: boolean; data?: User; error?: string }>('/auth/me'),

  // 修改密码
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ success: boolean; message?: string; error?: string }>('/auth/change-password', {
      oldPassword,
      newPassword,
    }),

  // 验证 Token
  verifyToken: () =>
    api.post<{ success: boolean; data?: User; error?: string }>('/auth/verify'),
}

// 保存 Token 到 localStorage
export const setToken = (token: string) => {
  localStorage.setItem('token', token)
}

// 获取 Token
export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

// 移除 Token
export const removeToken = () => {
  localStorage.removeItem('token')
}

// 保存用户信息到 localStorage
export const setUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user))
}

// 获取用户信息
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 移除用户信息
export const removeUser = () => {
  localStorage.removeItem('user')
}

// ============ 用户管理相关类型 ============

export type UserRole = 'ADMIN' | 'USER' | 'VIEWER'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '管理员',
  USER: '普通用户',
  VIEWER: '访客',
}

export interface UserListItem {
  id: string
  username: string
  name: string | null
  email: string | null
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  username: string
  password: string
  name?: string
  email?: string
  role?: UserRole
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  active?: boolean
}

export interface UserQueryParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  active?: boolean | string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedUsers {
  data: UserListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户管理 API
export const userApi = {
  // 获取用户列表
  getAll: (params?: UserQueryParams) =>
    api.get<{ success: boolean; data: PaginatedUsers }>('/users', { params }),

  // 获取单个用户
  getById: (id: string) =>
    api.get<{ success: boolean; data: UserListItem }>(`/users/${id}`),

  // 创建用户
  create: (data: CreateUserDto) =>
    api.post<{ success: boolean; data: UserListItem; message?: string; error?: string }>('/users', data),

  // 更新用户信息
  update: (id: string, data: UpdateUserDto) =>
    api.put<{ success: boolean; data: UserListItem; message?: string; error?: string }>(`/users/${id}`, data),

  // 更新用户角色
  updateRole: (id: string, role: UserRole) =>
    api.put<{ success: boolean; data: UserListItem; message?: string; error?: string }>(`/users/${id}/role`, { role }),

  // 更新用户状态（启用/禁用）
  updateStatus: (id: string, active: boolean) =>
    api.put<{ success: boolean; data: UserListItem; message?: string; error?: string }>(`/users/${id}/status`, { active }),

  // 重置密码
  resetPassword: (id: string, password: string) =>
    api.put<{ success: boolean; message?: string; error?: string }>(`/users/${id}/password`, { password }),

  // 删除用户
  delete: (id: string) =>
    api.delete<{ success: boolean; message?: string; error?: string }>(`/users/${id}`),
}
