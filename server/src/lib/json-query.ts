import { isPostgreSQL } from './database'
import { Prisma } from '@prisma/client'

/**
 * JSON 字段筛选条件
 */
export interface FieldFilterCondition {
  operator: 'contains' | 'notContains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' |
            'isEmpty' | 'isNotEmpty' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in'
  value: any
}

/**
 * 筛选条件映射
 */
export type FieldFilters = Record<string, FieldFilterCondition | string | any>

/**
 * JSON 查询适配器接口
 */
export interface JsonQueryAdapter {
  /**
   * 构建 JSON 字段查询的 WHERE 条件
   * @param fieldName 字段名
   * @param condition 筛选条件
   * @returns Prisma where 条件对象
   */
  buildJsonFieldFilter(fieldName: string, condition: FieldFilterCondition | string): any

  /**
   * 检查是否支持数据库层 JSON 查询
   */
  supportsNativeJsonQuery(): boolean

  /**
   * 获取数据库类型名称
   */
  getDatabaseType(): string
}

/**
 * PostgreSQL JSON 查询适配器
 * 使用 PostgreSQL 的 JSONB 原生查询能力
 */
export class PostgresJsonQueryAdapter implements JsonQueryAdapter {
  supportsNativeJsonQuery(): boolean {
    return true
  }

  getDatabaseType(): string {
    return 'postgresql'
  }

  buildJsonFieldFilter(fieldName: string, condition: FieldFilterCondition | string): any {
    // 旧格式兼容：字符串模糊匹配
    if (typeof condition === 'string') {
      return {
        data: {
          path: [fieldName],
          string_contains: condition.toLowerCase(),
        },
      }
    }

    const { operator, value: filterValue } = condition as FieldFilterCondition
    const path = [fieldName]

    switch (operator) {
      case 'equals':
        return {
          data: {
            path,
            equals: filterValue,
          },
        }

      case 'notEquals':
        return {
          NOT: {
            data: {
              path,
              equals: filterValue,
            },
          },
        }

      case 'contains':
        return {
          data: {
            path,
            string_contains: String(filterValue).toLowerCase(),
          },
        }

      case 'notContains':
        return {
          NOT: {
            data: {
              path,
              string_contains: String(filterValue).toLowerCase(),
            },
          },
        }

      case 'startsWith':
        return {
          data: {
            path,
            string_starts_with: String(filterValue).toLowerCase(),
          },
        }

      case 'endsWith':
        return {
          data: {
            path,
            string_ends_with: String(filterValue).toLowerCase(),
          },
        }

      case 'isEmpty':
        // PostgreSQL: 检查字段为 null 或不存在
        return {
          OR: [
            { data: { path, equals: Prisma.DbNull } },
            { data: { path, equals: null } },
            { data: { path, equals: '' } },
          ],
        }

      case 'isNotEmpty':
        // PostgreSQL: 检查字段不为 null 且不为空
        return {
          AND: [
            { data: { path, not: Prisma.DbNull } },
            { data: { path, not: null } },
            { data: { path, not: '' } },
          ],
        }

      case 'gt':
        return {
          data: {
            path,
            gt: Number(filterValue),
          },
        }

      case 'gte':
        return {
          data: {
            path,
            gte: Number(filterValue),
          },
        }

      case 'lt':
        return {
          data: {
            path,
            lt: Number(filterValue),
          },
        }

      case 'lte':
        return {
          data: {
            path,
            lte: Number(filterValue),
          },
        }

      case 'between':
        // between 操作符需要返回 AND 条件
        {
          const conditions: any[] = []
          if (filterValue.min !== undefined) {
            conditions.push({
              data: {
                path,
                gte: Number(filterValue.min),
              },
            })
          }
          if (filterValue.max !== undefined) {
            conditions.push({
              data: {
                path,
                lte: Number(filterValue.max),
              },
            })
          }
          return conditions.length > 0 ? { AND: conditions } : {}
        }

      case 'in':
        if (Array.isArray(filterValue)) {
          return {
            data: {
              path,
              in: filterValue,
            },
          }
        }
        return {}

      default:
        return {}
    }
  }
}

/**
 * SQLite JSON 查询适配器
 * SQLite 不支持原生 JSON 查询，需要标记为应用层过滤
 */
export class SqliteJsonQueryAdapter implements JsonQueryAdapter {
  supportsNativeJsonQuery(): boolean {
    return false // SQLite 不支持数据库层 JSON 查询
  }

  getDatabaseType(): string {
    return 'sqlite'
  }

  buildJsonFieldFilter(_fieldName: string, _condition: FieldFilterCondition | string): any {
    // SQLite 不支持原生 JSON 查询
    // 返回 null 表示需要在应用层过滤
    return null
  }
}

// 缓存的适配器实例
let cachedAdapter: JsonQueryAdapter | null = null

/**
 * 获取 JSON 查询适配器
 * 根据当前数据库类型返回对应的适配器实例
 */
export function getJsonQueryAdapter(): JsonQueryAdapter {
  if (!cachedAdapter) {
    if (isPostgreSQL()) {
      cachedAdapter = new PostgresJsonQueryAdapter()
      console.log('[JsonQuery] 使用 PostgreSQL JSON 查询适配器')
    } else {
      cachedAdapter = new SqliteJsonQueryAdapter()
      console.log('[JsonQuery] 使用 SQLite 查询适配器（应用层过滤）')
    }
  }

  return cachedAdapter
}

/**
 * 重置适配器缓存（用于测试）
 */
export function resetJsonQueryAdapter(): void {
  cachedAdapter = null
}

/**
 * 评估 JSON 字段条件（用于应用层过滤）
 * 当数据库不支持原生 JSON 查询时使用
 *
 * @param value 字段值
 * @param condition 筛选条件
 * @returns 是否匹配条件
 */
export function evaluateJsonCondition(value: any, condition: FieldFilterCondition | string | any): boolean {
  // 新格式：{ operator, value }
  if (typeof condition === 'object' && condition !== null && 'operator' in condition) {
    const { operator, value: filterValue } = condition as FieldFilterCondition
    const strValue = String(value ?? '').toLowerCase()
    const strFilter = String(filterValue ?? '').toLowerCase()

    switch (operator) {
      case 'contains':
        return strValue.includes(strFilter)
      case 'notContains':
        return !strValue.includes(strFilter)
      case 'equals':
        return strValue === strFilter
      case 'notEquals':
        return strValue !== strFilter
      case 'startsWith':
        return strValue.startsWith(strFilter)
      case 'endsWith':
        return strValue.endsWith(strFilter)
      case 'isEmpty':
        return value === undefined || value === null || value === ''
      case 'isNotEmpty':
        return value !== undefined && value !== null && value !== ''
      case 'gt':
        return Number(value) > Number(filterValue)
      case 'gte':
        return Number(value) >= Number(filterValue)
      case 'lt':
        return Number(value) < Number(filterValue)
      case 'lte':
        return Number(value) <= Number(filterValue)
      case 'between':
        if (filterValue.min !== undefined && Number(value) < filterValue.min) return false
        if (filterValue.max !== undefined && Number(value) > filterValue.max) return false
        if (filterValue.startDate !== undefined) {
          const valDate = new Date(value as string)
          const startDate = new Date(filterValue.startDate)
          if (valDate < startDate) return false
        }
        if (filterValue.endDate !== undefined) {
          const valDate = new Date(value as string)
          const endDate = new Date(filterValue.endDate)
          if (valDate > endDate) return false
        }
        return true
      case 'in':
        if (Array.isArray(filterValue)) {
          const val = Array.isArray(value) ? value : [value]
          return filterValue.some((v: any) => val.includes(v))
        }
        return false
      default:
        return true
    }
  }

  // 旧格式兼容：字符串模糊匹配
  if (typeof condition === 'string') {
    return String(value).toLowerCase().includes(condition.toLowerCase())
  }

  // 旧格式兼容：对象条件
  if (typeof condition === 'object' && condition !== null) {
    const c = condition as any
    if (c.min !== undefined && Number(value) < c.min) return false
    if (c.max !== undefined && Number(value) > c.max) return false
    if (c.startDate !== undefined) {
      const valDate = new Date(value as string)
      const startDate = new Date(c.startDate)
      if (valDate < startDate) return false
    }
    if (c.endDate !== undefined) {
      const valDate = new Date(value as string)
      const endDate = new Date(c.endDate)
      if (valDate > endDate) return false
    }
    if (c.values !== undefined && Array.isArray(c.values)) {
      const val = Array.isArray(value) ? value : [value]
      return c.values.some((v: any) => val.includes(v))
    }
    if (c.eq !== undefined) {
      return value === c.eq
    }
  }

  return true
}
