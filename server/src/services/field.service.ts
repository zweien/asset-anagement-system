import { PrismaClient, FieldConfig } from '@prisma/client'

const prisma = new PrismaClient()

// 字段类型枚举
export enum FieldTypeEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  TEXTAREA = 'TEXTAREA',
}

// 有效的字段类型
const VALID_FIELD_TYPES = Object.values(FieldTypeEnum)

// 创建字段配置 DTO
export interface CreateFieldDto {
  name: string
  label: string
  type: string
  required?: boolean
  isSystem?: boolean
  visible?: boolean
  options?: string // JSON 字符串
  defaultValue?: string
  validation?: string // JSON 字符串
  order?: number
}

// 更新字段配置 DTO
export interface UpdateFieldDto {
  name?: string
  label?: string
  type?: string
  required?: boolean
  isSystem?: boolean
  visible?: boolean
  options?: string
  defaultValue?: string
  validation?: string
  order?: number
}

// 验证字段类型
function validateFieldType(type: string): boolean {
  return VALID_FIELD_TYPES.includes(type as FieldTypeEnum)
}

// 验证 options 格式 (用于 SELECT 和 MULTISELECT)
function validateOptions(type: string, options?: string): { valid: boolean; error?: string } {
  // TEXT, NUMBER, DATE, TEXTAREA 不需要 options
  if (!['SELECT', 'MULTISELECT'].includes(type)) {
    return { valid: true }
  }

  // SELECT 和 MULTISELECT 必须有 options
  if (!options) {
    return { valid: false, error: `${type} 类型必须提供 options` }
  }

  try {
    const parsed = JSON.parse(options)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { valid: false, error: 'options 必须是非空数组' }
    }
    if (!parsed.every(item => typeof item === 'string')) {
      return { valid: false, error: 'options 数组元素必须是字符串' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'options 格式无效，必须是 JSON 数组' }
  }
}

// 字段配置服务
export const FieldService = {
  // 获取所有字段配置
  async getAll(): Promise<FieldConfig[]> {
    return prisma.fieldConfig.findMany({
      orderBy: { order: 'asc' },
    })
  },

  // 获取单个字段配置
  async getById(id: string): Promise<FieldConfig | null> {
    return prisma.fieldConfig.findUnique({
      where: { id },
    })
  },

  // 创建字段配置
  async create(data: CreateFieldDto): Promise<{ success: boolean; data?: FieldConfig; error?: string }> {
    // 验证字段类型
    if (!validateFieldType(data.type)) {
      return { success: false, error: `无效的字段类型: ${data.type}，有效类型: ${VALID_FIELD_TYPES.join(', ')}` }
    }

    // 验证 options
    const optionsValidation = validateOptions(data.type, data.options)
    if (!optionsValidation.valid) {
      return { success: false, error: optionsValidation.error }
    }

    // 检查 name 是否重复
    const existing = await prisma.fieldConfig.findFirst({
      where: { name: data.name },
    })
    if (existing) {
      return { success: false, error: `字段名称 "${data.name}" 已存在` }
    }

    // 获取最大 order
    const maxOrder = await prisma.fieldConfig.aggregate({
      _max: { order: true },
    })
    const order = data.order ?? (maxOrder._max.order ?? 0) + 1

    try {
      const field = await prisma.fieldConfig.create({
        data: {
          name: data.name,
          label: data.label,
          type: data.type,
          required: data.required ?? false,
          isSystem: data.isSystem ?? false,
          visible: data.visible ?? true,
          options: data.options,
          defaultValue: data.defaultValue,
          validation: data.validation,
          order,
        },
      })
      return { success: true, data: field }
    } catch (error) {
      return { success: false, error: '创建字段配置失败' }
    }
  },

  // 更新字段配置
  async update(id: string, data: UpdateFieldDto): Promise<{ success: boolean; data?: FieldConfig; error?: string }> {
    // 检查字段是否存在
    const existing = await prisma.fieldConfig.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: '字段配置不存在' }
    }

    // 如果更新类型，验证类型
    if (data.type && !validateFieldType(data.type)) {
      return { success: false, error: `无效的字段类型: ${data.type}` }
    }

    // 如果更新 name，检查是否重复
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.fieldConfig.findFirst({
        where: { name: data.name },
      })
      if (duplicate) {
        return { success: false, error: `字段名称 "${data.name}" 已存在` }
      }
    }

    // 验证 options
    const type = data.type ?? existing.type
    const options = data.options ?? existing.options
    const optionsValidation = validateOptions(type, options ?? undefined)
    if (!optionsValidation.valid) {
      return { success: false, error: optionsValidation.error }
    }

    try {
      const field = await prisma.fieldConfig.update({
        where: { id },
        data: {
          name: data.name,
          label: data.label,
          type: data.type,
          required: data.required,
          isSystem: data.isSystem,
          visible: data.visible,
          options: data.options,
          defaultValue: data.defaultValue,
          validation: data.validation,
          order: data.order,
        },
      })
      return { success: true, data: field }
    } catch (error) {
      return { success: false, error: '更新字段配置失败' }
    }
  },

  // 删除字段配置
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    // 检查字段是否存在
    const existing = await prisma.fieldConfig.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: '字段配置不存在' }
    }

    // 系统字段不可删除
    if (existing.isSystem) {
      return { success: false, error: '系统字段不可删除' }
    }

    try {
      await prisma.fieldConfig.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      return { success: false, error: '删除字段配置失败' }
    }
  },

  // 重新排序
  async reorder(orders: { id: string; order: number }[]): Promise<{ success: boolean; error?: string }> {
    try {
      // 使用事务批量更新
      await prisma.$transaction(
        orders.map(item =>
          prisma.fieldConfig.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      )
      return { success: true }
    } catch (error) {
      return { success: false, error: '重新排序失败' }
    }
  },
}
