/**
 * 生成测试资产数据脚本
 * 使用方法: npx ts-node scripts/seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 资产状态类型
type AssetStatus = 'ACTIVE' | 'IDLE' | 'DAMAGED' | 'SCRAPPED'

// 随机选择数组元素
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// 随机整数
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

// 生成随机日期（过去一年内）
const randomDate = (): Date => {
  const now = new Date()
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const diff = now.getTime() - pastYear.getTime()
  return new Date(pastYear.getTime() + Math.random() * diff)
}

// 测试数据配置
const DEPARTMENTS = ['研发部', '产品部', '设计部', '市场部', '财务部', '人事部', '运营部', '技术部']
const USERS = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八']
const ASSET_TYPES = ['笔记本电脑', '台式电脑', '显示器', '键盘', '鼠标', '打印机', '投影仪',
  '服务器', '交换机', '路由器', 'UPS电源', '办公桌', '办公椅', '文件柜', '空调', '电话机']
const TYPE1_OPTIONS = ['A', 'B', 'C']
const STATUS_OPTIONS: AssetStatus[] = ['ACTIVE', 'IDLE', 'DAMAGED', 'SCRAPPED']
const COMMENTS = ['状态良好', '需维护', '新购入', '正常使用中', '备用', '待分配', '', '', '']

// 生成单个资产数据
const generateAsset = (index: number) => {
  const type = randomChoice(ASSET_TYPES)
  const department = randomChoice(DEPARTMENTS)
  const status = randomChoice(STATUS_OPTIONS)
  const user = status === 'ACTIVE' ? randomChoice(USERS) : ''
  const type1 = randomChoice(TYPE1_OPTIONS)
  const comment = randomChoice(COMMENTS)
  const createdAt = randomDate()

  // 生成资产编号：前缀 + 年月 + 序号
  const prefix = type.substring(0, 2).toUpperCase()
  const yearMonth = createdAt.toISOString().substring(0, 7).replace('-', '')
  const seq = String(index).padStart(4, '0')
  const code = `${prefix}${yearMonth}${seq}`

  // 资产名称
  const name = `${type}-${department}-${index}`

  // 动态字段数据
  const data: Record<string, unknown> = {}
  if (comment) data.comment = comment
  if (type1) data.type1 = type1
  if (user) data.user = user

  return {
    name,
    code,
    status,
    data: JSON.stringify(data),
    createdAt,
    updatedAt: createdAt,
  }
}

async function main() {
  console.log('开始生成测试数据...')

  // 检查现有数据量
  const existingCount = await prisma.asset.count()
  console.log(`现有资产数量: ${existingCount}`)

  // 生成2000条数据，分批插入
  const batchSize = 100
  const totalCount = 2000
  const batches = Math.ceil(totalCount / batchSize)

  for (let batch = 0; batch < batches; batch++) {
    const start = batch * batchSize
    const end = Math.min(start + batchSize, totalCount)
    const assets = []

    for (let i = start; i < end; i++) {
      assets.push(generateAsset(i + 1))
    }

    await prisma.asset.createMany({
      data: assets,
    })

    console.log(`已插入 ${end}/${totalCount} 条数据...`)
  }

  // 验证插入结果
  const finalCount = await prisma.asset.count()
  console.log(`\n完成! 当前资产总数: ${finalCount}`)

  // 显示状态分布
  const statusCounts = await prisma.asset.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n状态分布:')
  statusCounts.forEach(({ status, _count }) => {
    console.log(`  ${status}: ${_count}`)
  })
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
