import mysql from 'mysql2/promise'
import pg from 'pg'
import { prisma } from '../lib/database'

// 数据库连接配置
export interface DBConnectionConfig {
  type: 'mysql' | 'postgresql'
  host: string
  port: number
  database: string
  username: string
  password: string
}

// 表信息
export interface TableInfo {
  name: string
  columns: ColumnInfo[]
  rowCount?: number
}

// 列信息
export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
}

// 字段映射
export interface FieldMapping {
  sourceColumn: string
  targetField: string // 'name', 'code', 'status', 或动态字段名
}

export const DBImportService = {
  // 测试数据库连接
  async testConnection(config: DBConnectionConfig) {
    try {
      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
          connectTimeout: 10000,
        })
        await connection.ping()
        await connection.end()
        return { success: true, message: 'MySQL 连接成功' }
      } else if (config.type === 'postgresql') {
        const client = new pg.Client({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
          connectionTimeoutMillis: 10000,
        })
        await client.connect()
        await client.end()
        return { success: true, message: 'PostgreSQL 连接成功' }
      }
      return { success: false, error: '不支持的数据库类型' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接失败',
      }
    }
  },

  // 获取所有表
  async getTables(config: DBConnectionConfig) {
    try {
      const tables: TableInfo[] = []

      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })

        // 获取表列表
        const [rows] = await connection.query(
          `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
          [config.database]
        )

        for (const row of rows as any[]) {
          const tableName = row.TABLE_NAME

          // 获取列信息
          const [columns] = await connection.query(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [config.database, tableName]
          )

          // 获取行数
          const [countResult] = await connection.query(
            `SELECT COUNT(*) as count FROM \`${tableName}\``
          )

          tables.push({
            name: tableName,
            columns: (columns as any[]).map((col) => ({
              name: col.COLUMN_NAME,
              type: col.DATA_TYPE,
              nullable: col.IS_NULLABLE === 'YES',
              isPrimaryKey: col.COLUMN_KEY === 'PRI',
            })),
            rowCount: (countResult as any[])[0].count,
          })
        }

        await connection.end()
      } else if (config.type === 'postgresql') {
        const client = new pg.Client({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })
        await client.connect()

        // 获取表列表
        const result = await client.query(
          `SELECT table_name FROM information_schema.tables
           WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
        )

        for (const row of result.rows) {
          const tableName = row.table_name

          // 获取列信息
          const columnsResult = await client.query(
            `SELECT column_name, data_type, is_nullable,
                    EXISTS(SELECT 1 FROM information_schema.table_constraints tc
                           JOIN information_schema.key_column_usage kcu
                           ON tc.constraint_name = kcu.constraint_name
                           WHERE tc.table_name = $1 AND kcu.column_name = c.column_name
                           AND tc.constraint_type = 'PRIMARY KEY') as is_primary_key
             FROM information_schema.columns c
             WHERE table_schema = 'public' AND table_name = $1
             ORDER BY ordinal_position`,
            [tableName]
          )

          // 获取行数
          const countResult = await client.query(
            `SELECT COUNT(*) as count FROM "${tableName}"`
          )

          tables.push({
            name: tableName,
            columns: columnsResult.rows.map((col: any) => ({
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES',
              isPrimaryKey: col.is_primary_key,
            })),
            rowCount: parseInt(countResult.rows[0].count),
          })
        }

        await client.end()
      }

      return { success: true, data: tables }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取表信息失败',
      }
    }
  },

  // 预览表数据
  async previewData(config: DBConnectionConfig, tableName: string, limit = 100) {
    try {
      let rows: Record<string, any>[] = []

      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })

        const [result] = await connection.query(
          `SELECT * FROM \`${tableName}\` LIMIT ${limit}`
        )
        rows = result as any[]

        await connection.end()
      } else if (config.type === 'postgresql') {
        const client = new pg.Client({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })
        await client.connect()

        const result = await client.query(
          `SELECT * FROM "${tableName}" LIMIT ${limit}`
        )
        rows = result.rows

        await client.end()
      }

      return { success: true, data: rows }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败',
      }
    }
  },

  // 执行导入
  async importData(
    config: DBConnectionConfig,
    tableName: string,
    mapping: FieldMapping[],
    batchSize = 100
  ) {
    try {
      let imported = 0
      let failed = 0
      const errors: string[] = []

      // 获取所有数据
      let rows: Record<string, any>[] = []

      if (config.type === 'mysql') {
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })

        const [result] = await connection.query(`SELECT * FROM \`${tableName}\``)
        rows = result as any[]

        await connection.end()
      } else if (config.type === 'postgresql') {
        const client = new pg.Client({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.username,
          password: config.password,
        })
        await client.connect()

        const result = await client.query(`SELECT * FROM "${tableName}"`)
        rows = result.rows

        await client.end()
      }

      // 批量导入
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)

        for (const row of batch) {
          try {
            // 构建资产数据
            const assetData: Record<string, any> = {}
            const dynamicData: Record<string, any> = {}

            for (const map of mapping) {
              const value = row[map.sourceColumn]

              if (map.targetField === 'name') {
                assetData.name = String(value || '')
              } else if (map.targetField === 'code') {
                assetData.code = value ? String(value) : null
              } else if (map.targetField === 'status') {
                assetData.status = value || 'ACTIVE'
              } else {
                // 动态字段
                dynamicData[map.targetField] = value
              }
            }

            if (!assetData.name) {
              failed++
              errors.push(`第 ${i + 1} 行缺少名称`)
              continue
            }

            // 检查编号是否重复
            if (assetData.code) {
              const existing = await prisma.asset.findFirst({
                where: { code: assetData.code, deletedAt: null },
              })
              if (existing) {
                failed++
                errors.push(`第 ${i + 1} 行编号 "${assetData.code}" 已存在`)
                continue
              }
            }

            await prisma.asset.create({
              data: {
                name: assetData.name,
                code: assetData.code,
                status: assetData.status || 'ACTIVE',
                data: JSON.stringify(dynamicData),
              },
            })
            imported++
          } catch (err) {
            failed++
            errors.push(`第 ${i + 1} 行: ${err instanceof Error ? err.message : '导入失败'}`)
          }
        }
      }

      return {
        success: true,
        data: {
          total: rows.length,
          imported,
          failed,
          errors: errors.slice(0, 10), // 只返回前10个错误
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导入失败',
      }
    }
  },
}
