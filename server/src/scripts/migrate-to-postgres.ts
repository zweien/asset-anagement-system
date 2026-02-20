#!/usr/bin/env npx ts-node
/**
 * SQLite 到 PostgreSQL 数据迁移脚本
 * ================================
 *
 * 使用方法:
 *   1. 确保 PostgreSQL 数据库已运行并可连接
 *   2. 设置环境变量 DATABASE_URL 指向 PostgreSQL
 *   3. 设置环境变量 SQLITE_SOURCE 指向源 SQLite 文件（默认: ../data/assets.db）
 *   4. 运行: npx ts-node src/scripts/migrate-to-postgres.ts
 *
 * 注意:
 *   - 迁移前请先备份 SQLite 数据库
 *   - 确保 PostgreSQL schema 已推送（npx prisma db push --schema=prisma/schema.postgresql.prisma）
 *   - 迁移会清空 PostgreSQL 中的现有数据
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import path from 'path'

// PostgreSQL 连接（目标）
const pgPrisma = new PrismaClient()

// SQLite 连接（源）
const sqlitePath = process.env.SQLITE_SOURCE || path.join(__dirname, '../../data/assets.db')
const sqlite = new Database(sqlitePath, { readonly: true })

interface MigrationResult {
  table: string
  total: number
  migrated: number
  errors: string[]
}

async function migrateTable(
  tableName: string,
  migrateRow: (row: any) => any
): Promise<MigrationResult> {
  const result: MigrationResult = {
    table: tableName,
    total: 0,
    migrated: 0,
    errors: [],
  }

  try {
    // 读取 SQLite 数据
    const rows: any[] = sqlite.prepare(`SELECT * FROM ${tableName}`).all()
    result.total = rows.length

    console.log(`[迁移] ${tableName}: 找到 ${rows.length} 条记录`)

    // 批量迁移
    for (const row of rows) {
      try {
        const data = migrateRow(row)
        // 根据表名调用对应的 Prisma 方法
        switch (tableName) {
          case 'users':
            await pgPrisma.user.create({ data })
            break
          case 'field_configs':
            await pgPrisma.fieldConfig.create({ data })
            break
          case 'categories':
            await pgPrisma.category.create({ data })
            break
          case 'assets':
            await pgPrisma.asset.create({ data })
            break
          case 'asset_images':
            await pgPrisma.assetImage.create({ data })
            break
          case 'operation_logs':
            await pgPrisma.operationLog.create({ data })
            break
          case 'system_configs':
            await pgPrisma.systemConfig.create({ data })
            break
          case 'report_templates':
            await pgPrisma.reportTemplate.create({ data })
            break
        }
        result.migrated++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '未知错误'
        result.errors.push(`ID ${row.id}: ${errorMsg}`)
      }
    }

    console.log(`[完成] ${tableName}: 迁移 ${result.migrated}/${result.total} 条记录`)
    if (result.errors.length > 0) {
      console.log(`[警告] ${tableName}: ${result.errors.length} 条记录失败`)
    }
  } catch (err) {
    console.error(`[错误] ${tableName}: ${err}`)
  }

  return result
}

async function main() {
  console.log('========================================')
  console.log('  SQLite -> PostgreSQL 数据迁移工具')
  console.log('========================================')
  console.log('')
  console.log(`源数据库: ${sqlitePath}`)
  console.log(`目标数据库: ${process.env.DATABASE_URL?.substring(0, 50)}...`)
  console.log('')

  // 检查 PostgreSQL 连接
  try {
    await pgPrisma.$queryRaw`SELECT 1`
    console.log('[连接] PostgreSQL 连接成功')
  } catch (err) {
    console.error('[错误] 无法连接到 PostgreSQL，请检查 DATABASE_URL 环境变量')
    process.exit(1)
  }

  // 检查 SQLite 文件
  try {
    sqlite.prepare('SELECT 1').get()
    console.log('[连接] SQLite 连接成功')
  } catch (err) {
    console.error('[错误] 无法打开 SQLite 数据库，请检查 SQLITE_SOURCE 环境变量')
    process.exit(1)
  }

  console.log('')
  console.log('[警告] 此操作将清空 PostgreSQL 中的现有数据！')
  console.log('')

  // 按依赖顺序迁移
  const results: MigrationResult[] = []

  // 1. 用户表
  console.log('[1/8] 迁移用户表...')
  await pgPrisma.user.deleteMany()
  results.push(await migrateTable('users', (row) => ({
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    active: row.active === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  })))

  // 2. 字段配置表
  console.log('[2/8] 迁移字段配置表...')
  await pgPrisma.fieldConfig.deleteMany()
  results.push(await migrateTable('field_configs', (row) => ({
    id: row.id,
    name: row.name,
    label: row.label,
    type: row.type,
    required: row.required === 1,
    isSystem: row.isSystem === 1,
    visible: row.visible === 1,
    options: row.options,
    defaultValue: row.defaultValue,
    validation: row.validation,
    order: row.order,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  })))

  // 3. 分类表（需要处理自引用）
  console.log('[3/8] 迁移分类表...')
  await pgPrisma.category.deleteMany()
  const categories: any[] = sqlite.prepare('SELECT * FROM categories ORDER BY "order"').all()
  const categoryResult: MigrationResult = { table: 'categories', total: categories.length, migrated: 0, errors: [] }

  // 先创建没有父分类的分类
  for (const row of categories.filter((c) => !c.parentId)) {
    try {
      await pgPrisma.category.create({
        data: {
          id: row.id,
          name: row.name,
          parentId: null,
          description: row.description,
          order: row.order,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        },
      })
      categoryResult.migrated++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      categoryResult.errors.push(`ID ${row.id}: ${errorMsg}`)
    }
  }

  // 再创建有父分类的分类
  for (const row of categories.filter((c) => c.parentId)) {
    try {
      await pgPrisma.category.create({
        data: {
          id: row.id,
          name: row.name,
          parentId: row.parentId,
          description: row.description,
          order: row.order,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        },
      })
      categoryResult.migrated++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      categoryResult.errors.push(`ID ${row.id}: ${errorMsg}`)
    }
  }
  results.push(categoryResult)
  console.log(`[完成] categories: 迁移 ${categoryResult.migrated}/${categoryResult.total} 条记录`)

  // 4. 资产表（需要转换 JSON 字段）
  console.log('[4/8] 迁移资产表...')
  await pgPrisma.asset.deleteMany()
  results.push(await migrateTable('assets', (row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    categoryId: row.categoryId,
    status: row.status,
    data: JSON.parse(row.data || '{}'), // SQLite String -> PostgreSQL Json
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    deletedAt: row.deletedAt ? new Date(row.deletedAt) : null,
  })))

  // 5. 资产图片表
  console.log('[5/8] 迁移资产图片表...')
  await pgPrisma.assetImage.deleteMany()
  results.push(await migrateTable('asset_images', (row) => ({
    id: row.id,
    assetId: row.assetId,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    size: row.size,
    path: row.path,
    createdAt: new Date(row.createdAt),
  })))

  // 6. 操作日志表（需要转换 JSON 字段）
  console.log('[6/8] 迁移操作日志表...')
  await pgPrisma.operationLog.deleteMany()
  results.push(await migrateTable('operation_logs', (row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    userId: row.userId,
    userName: row.userName,
    oldValue: row.oldValue ? JSON.parse(row.oldValue) : null,
    newValue: row.newValue ? JSON.parse(row.newValue) : null,
    ip: row.ip,
    userAgent: row.userAgent,
    createdAt: new Date(row.createdAt),
  })))

  // 7. 系统配置表
  console.log('[7/8] 迁移系统配置表...')
  await pgPrisma.systemConfig.deleteMany()
  results.push(await migrateTable('system_configs', (row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    description: row.description,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  })))

  // 8. 报表模板表
  console.log('[8/8] 迁移报表模板表...')
  await pgPrisma.reportTemplate.deleteMany()
  results.push(await migrateTable('report_templates', (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    chartType: row.chartType,
    dimension: row.dimension,
    filters: row.filters ? JSON.parse(row.filters) : null,
    dateRange: row.dateRange,
    customStartDate: row.customStartDate,
    customEndDate: row.customEndDate,
    isDefault: row.isDefault === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  })))

  // 打印汇总
  console.log('')
  console.log('========================================')
  console.log('  迁移汇总')
  console.log('========================================')
  let totalRecords = 0
  let totalMigrated = 0
  let totalErrors = 0

  for (const result of results) {
    totalRecords += result.total
    totalMigrated += result.migrated
    totalErrors += result.errors.length

    const status = result.migrated === result.total ? '✓' : '!'
    console.log(`${status} ${result.table}: ${result.migrated}/${result.total}`)

    if (result.errors.length > 0 && result.errors.length <= 5) {
      result.errors.forEach(err => console.log(`    - ${err}`))
    } else if (result.errors.length > 5) {
      result.errors.slice(0, 3).forEach(err => console.log(`    - ${err}`))
      console.log(`    - ... 还有 ${result.errors.length - 3} 个错误`)
    }
  }

  console.log('')
  console.log(`总计: ${totalMigrated}/${totalRecords} 条记录成功迁移`)
  if (totalErrors > 0) {
    console.log(`失败: ${totalErrors} 条记录`)
  }
  console.log('')

  // 关闭连接
  sqlite.close()
  await pgPrisma.$disconnect()

  console.log('[完成] 迁移完成！')
}

main().catch((err) => {
  console.error('[错误] 迁移失败:', err)
  process.exit(1)
})
