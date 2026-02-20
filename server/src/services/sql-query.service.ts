import { prisma, isPostgreSQL } from '../lib/database'

// 允许查询的表白名单
const ALLOWED_TABLES = [
  'assets',
  'categories',
  'field_configs',
  'asset_images',
  'operation_logs',
  'users',
  'system_configs',
]

// 危险的 SQL 关键字黑名单
const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'REPLACE',
  'MERGE',
  'CALL',
  'EXEC',
  'EXECUTE',
  'GRANT',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
  'SAVEPOINT',
]

// SQL 注入检测模式
const SQL_INJECTION_PATTERNS = [
  /;\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/i,
  /UNION\s+SELECT/i,
  /OR\s+1\s*=\s*1/i,
  /OR\s+'1'\s*=\s*'1'/i,
  /'\s*OR\s*'/i,
  /--/,
  /\/\*/,
  /\*\//,
  /xp_/i,
  /sp_/i,
  /@@version/i,
  /information_schema/i,
  /sys\./i,
  /mysql\./i,
  /pg_/i,
  /sqlite_master/i,
]

export interface SqlQueryResult {
  success: boolean
  data?: Array<Record<string, unknown>>
  error?: string
  rowCount?: number
  executionTime?: number
  columns?: string[]
}

export interface SqlQueryRequest {
  sql: string
}

// 验证 SQL 语句安全性
function validateSql(sql: string): { valid: boolean; error?: string } {
  const normalizedSql = sql.trim().toUpperCase()

  // 检查是否以 SELECT 开头
  if (!normalizedSql.startsWith('SELECT')) {
    return { valid: false, error: '只允许 SELECT 查询语句' }
  }

  // 检查是否包含危险关键字
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(sql)) {
      return { valid: false, error: `禁止使用 ${keyword} 关键字` }
    }
  }

  // 检查 SQL 注入模式
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(sql)) {
      return { valid: false, error: '检测到潜在的 SQL 注入攻击' }
    }
  }

  // 检查是否查询允许的表
  const tablePattern = /FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi
  const joinPattern = /JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi
  const tables: string[] = []

  let match
  while ((match = tablePattern.exec(sql)) !== null) {
    tables.push(match[1].toLowerCase())
  }
  while ((match = joinPattern.exec(sql)) !== null) {
    tables.push(match[1].toLowerCase())
  }

  for (const table of tables) {
    if (!ALLOWED_TABLES.includes(table)) {
      return { valid: false, error: `不允许查询表: ${table}` }
    }
  }

  return { valid: true }
}

// 过滤敏感数据并处理 BigInt
function sanitizeResult(data: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret']

  return data.map(row => {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      // 过滤敏感字段
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***'
      } else if (typeof value === 'bigint') {
        // 将 BigInt 转换为 Number
        sanitized[key] = Number(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  })
}

// 执行 SQL 查询
export const SqlQueryService = {
  async executeQuery(sql: string): Promise<SqlQueryResult> {
    const startTime = Date.now()

    try {
      // 验证 SQL
      const validation = validateSql(sql)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        }
      }

      // 添加结果限制（防止返回过多数据）
      const limitPattern = /LIMIT\s+\d+/i
      let finalSql = sql.trim()
      if (!limitPattern.test(finalSql)) {
        // 如果没有 LIMIT，添加默认限制
        finalSql = `${finalSql} LIMIT 1000`
      } else {
        // 检查 LIMIT 值是否过大
        const limitMatch = finalSql.match(/LIMIT\s+(\d+)/i)
        if (limitMatch && parseInt(limitMatch[1]) > 5000) {
          finalSql = finalSql.replace(/LIMIT\s+\d+/i, 'LIMIT 5000')
        }
      }

      // 执行查询
      const result = await prisma.$queryRawUnsafe(finalSql)

      // 处理结果
      let data = Array.isArray(result) ? result : [result]
      data = sanitizeResult(data)

      // 获取列名
      const columns = data.length > 0 ? Object.keys(data[0]) : []

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data,
        rowCount: data.length,
        columns,
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('SQL 查询执行错误:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : '查询执行失败',
        executionTime,
      }
    }
  },

  // 获取允许查询的表列表
  getAllowedTables(): string[] {
    return [...ALLOWED_TABLES]
  },

  // 获取表结构信息（支持 SQLite 和 PostgreSQL）
  async getTableSchema(tableName: string): Promise<{ success: boolean; columns?: Array<{ name: string; type: string }>; error?: string }> {
    if (!ALLOWED_TABLES.includes(tableName)) {
      return { success: false, error: `不允许查询表: ${tableName}` }
    }

    try {
      if (isPostgreSQL()) {
        // PostgreSQL: 使用 information_schema 查询
        const result = await prisma.$queryRawUnsafe(
          `SELECT column_name as name, data_type as type
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1
           ORDER BY ordinal_position`,
          tableName
        ) as Array<{ name: string; type: string }>

        return {
          success: true,
          columns: result.map(col => ({
            name: col.name,
            type: col.type,
          })),
        }
      } else {
        // SQLite: 使用 PRAGMA 查询
        const result = await prisma.$queryRawUnsafe(
          `PRAGMA table_info(${tableName})`
        ) as Array<{ name: string; type: string }>

        return {
          success: true,
          columns: result.map(col => ({
            name: col.name,
            type: col.type,
          })),
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取表结构失败',
      }
    }
  },
}
