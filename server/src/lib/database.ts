import { PrismaClient } from '@prisma/client'

/**
 * 数据库类型枚举
 */
export type DatabaseType = 'sqlite' | 'postgresql'

/**
 * 从 DATABASE_URL 检测数据库类型
 * - SQLite: file:./path/to/db.db 或 file:../data/assets.db
 * - PostgreSQL: postgresql://user:password@host:port/database
 */
export function detectDatabaseType(): DatabaseType {
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    return 'postgresql'
  }

  // 默认为 SQLite
  return 'sqlite'
}

/**
 * 检查当前是否使用 PostgreSQL
 */
export function isPostgreSQL(): boolean {
  return detectDatabaseType() === 'postgresql'
}

/**
 * 检查当前是否使用 SQLite
 */
export function isSQLite(): boolean {
  return detectDatabaseType() === 'sqlite'
}

/**
 * 获取数据库类型名称（用于日志和提示）
 */
export function getDatabaseTypeName(): string {
  const type = detectDatabaseType()
  return type === 'postgresql' ? 'PostgreSQL' : 'SQLite'
}

// PrismaClient 单例
let prismaClient: PrismaClient | null = null

/**
 * 获取 PrismaClient 单例实例
 *
 * 使用单例模式避免在开发模式下创建过多连接，
 * 同时确保所有服务使用同一个数据库连接实例。
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    const dbType = detectDatabaseType()
    console.log(`[Database] 初始化数据库连接，类型: ${dbType}`)

    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    })

    // 优雅关闭连接
    process.on('beforeExit', async () => {
      if (prismaClient) {
        await prismaClient.$disconnect()
        console.log('[Database] 数据库连接已关闭')
      }
    })
  }

  return prismaClient
}

/**
 * 断开数据库连接（用于测试和清理）
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect()
    prismaClient = null
    console.log('[Database] 数据库连接已断开')
  }
}

// 导出默认的 prisma 实例，方便直接使用
export const prisma = getPrismaClient()

// 默认导出
export default prisma
