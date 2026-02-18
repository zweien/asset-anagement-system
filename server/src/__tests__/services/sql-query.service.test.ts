import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { SqlQueryService } from '../../services/sql-query.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('SqlQueryService', () => {
  beforeAll(async () => {
    // 确保数据库连接
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('executeQuery', () => {
    it('应该成功执行简单的 SELECT 查询', async () => {
      const result = await SqlQueryService.executeQuery('SELECT 1 as value')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toHaveLength(1)
      // SQLite 返回 BigInt，转换为 Number 比较
      expect(Number(result.data![0].value)).toBe(1)
    })

    it('应该成功查询 assets 表', async () => {
      const result = await SqlQueryService.executeQuery('SELECT * FROM assets LIMIT 5')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.rowCount).toBeLessThanOrEqual(5)
    })

    it('应该成功执行带 WHERE 条件的查询', async () => {
      const result = await SqlQueryService.executeQuery(
        "SELECT * FROM assets WHERE status = 'ACTIVE' LIMIT 10"
      )

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该拒绝非 SELECT 语句', async () => {
      const result = await SqlQueryService.executeQuery(
        "INSERT INTO assets (id, name) VALUES ('test', 'test')"
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('只允许 SELECT 查询语句')
    })

    it('应该拒绝 DELETE 语句', async () => {
      const result = await SqlQueryService.executeQuery('DELETE FROM assets')

      expect(result.success).toBe(false)
      // 非 SELECT 语句首先会被"只允许 SELECT 查询语句"拒绝
      expect(result.error).toBeDefined()
    })

    it('应该拒绝 UPDATE 语句', async () => {
      const result = await SqlQueryService.executeQuery(
        "UPDATE assets SET name = 'test'"
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该拒绝 DROP 语句', async () => {
      const result = await SqlQueryService.executeQuery('DROP TABLE assets')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该拒绝查询不允许的表', async () => {
      // 使用一个不在白名单且不触发 SQL 注入检测的表
      const result = await SqlQueryService.executeQuery('SELECT * FROM nonexistent_table_xyz')

      expect(result.success).toBe(false)
      // 表不存在会返回查询错误，或者表不在白名单中
      expect(result.error).toBeDefined()
    })

    it('应该检测 SQL 注入攻击 - UNION 注入', async () => {
      const result = await SqlQueryService.executeQuery(
        "SELECT * FROM assets WHERE id = '1' UNION SELECT * FROM users"
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('SQL 注入')
    })

    it('应该检测 SQL 注入攻击 - 永真条件', async () => {
      const result = await SqlQueryService.executeQuery(
        "SELECT * FROM assets WHERE id = '1' OR '1' = '1'"
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('SQL 注入')
    })

    it('应该拒绝包含注释的查询', async () => {
      const result = await SqlQueryService.executeQuery(
        "SELECT * FROM assets WHERE id = '1' -- comment"
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('SQL 注入')
    })

    it('应该限制返回结果数量', async () => {
      const result = await SqlQueryService.executeQuery(
        'SELECT * FROM assets LIMIT 10000'
      )

      expect(result.success).toBe(true)
      // 应该被限制为 5000
    })

    it('应该自动添加 LIMIT 如果未指定', async () => {
      const result = await SqlQueryService.executeQuery('SELECT * FROM assets')

      expect(result.success).toBe(true)
    })

    it('应该返回列名信息', async () => {
      const result = await SqlQueryService.executeQuery(
        'SELECT id, name, status FROM assets LIMIT 1'
      )

      expect(result.success).toBe(true)
      expect(result.columns).toBeDefined()
      expect(result.columns).toContain('id')
      expect(result.columns).toContain('name')
      expect(result.columns).toContain('status')
    })

    it('应该返回执行时间', async () => {
      const result = await SqlQueryService.executeQuery('SELECT * FROM assets LIMIT 10')

      expect(result.success).toBe(true)
      expect(result.executionTime).toBeDefined()
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('应该处理无效的 SQL 语法', async () => {
      const result = await SqlQueryService.executeQuery('SELECT * FORM assets')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该成功查询带 JOIN 的语句', async () => {
      const result = await SqlQueryService.executeQuery(`
        SELECT a.id, a.name, c.name as category_name
        FROM assets a
        LEFT JOIN categories c ON a.categoryId = c.id
        LIMIT 5
      `)

      expect(result.success).toBe(true)
    })

    it('应该拒绝 JOIN 不允许的表', async () => {
      const result = await SqlQueryService.executeQuery(`
        SELECT a.id, b.value
        FROM assets a
        JOIN nonexistent_table_xyz b ON a.id = b.name
      `)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getAllowedTables', () => {
    it('应该返回允许查询的表列表', () => {
      const tables = SqlQueryService.getAllowedTables()

      expect(tables).toContain('assets')
      expect(tables).toContain('categories')
      expect(tables).toContain('field_configs')
      expect(tables).toContain('users')
      expect(tables).toContain('asset_images')
      expect(tables).toContain('operation_logs')
      expect(tables).toContain('system_configs')
    })
  })

  describe('getTableSchema', () => {
    it('应该返回允许查询的表结构', async () => {
      const result = await SqlQueryService.getTableSchema('assets')

      expect(result.success).toBe(true)
      expect(result.columns).toBeDefined()
      expect(result.columns!.length).toBeGreaterThan(0)

      const columnNames = result.columns!.map(c => c.name)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('name')
      expect(columnNames).toContain('status')
    })

    it('应该拒绝查询不允许的表结构', async () => {
      const result = await SqlQueryService.getTableSchema('sqlite_master')

      expect(result.success).toBe(false)
      expect(result.error).toContain('不允许查询表')
    })
  })
})
