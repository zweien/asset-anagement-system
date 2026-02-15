import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
