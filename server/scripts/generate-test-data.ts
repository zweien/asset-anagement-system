/**
 * 生成测试资产数据脚本
 * 直接通过 Prisma 生成 200 个随机资产
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 状态常量
const statuses = ['ACTIVE', 'IDLE', 'DAMAGED', 'SCRAPPED']

// 随机数据生成器
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

// 资产名称前缀和后缀
const namePrefixes = ['办公', '生产', '测试', '研发', '财务', '人事', '市场', '销售', '仓储', '物流']
const nameMiddles = ['电脑', '服务器', '打印机', '投影仪', '显示器', '键盘', '鼠标', '桌椅', '柜子', '空调', '交换机', '路由器', '摄像头', '电话', '传真机']
const nameSuffixes = ['设备', '器材', '工具', '装置', '系统', '终端', '工作站', '主机', '配件', '组件']

// 使用人姓名
const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高']
const givenNames = ['伟', '芳', '娜', '敏', '静', '强', '磊', '洋', '勇', '艳', '杰', '涛', '明', '超', '华', '军', '平', '建', '国', '文']

// 备注文本
const comments = [
  '状态良好', '需要维护', '新购置', '使用中', '备用设备',
  '定期检查', '已保养', '运行正常', '性能稳定', '待维修',
  '', '', '', '', ''
]

// 类型列表
const types = ['A', 'B', 'C']

// 生成随机资产名称
const generateName = (): string => {
  const prefix = randomItem(namePrefixes)
  const middle = randomItem(nameMiddles)
  const suffix = Math.random() > 0.5 ? randomItem(nameSuffixes) : ''
  const number = Math.random() > 0.7 ? `-${randomInt(1, 99)}` : ''
  return `${prefix}${middle}${suffix}${number}`
}

// 生成随机资产编号
const generateCode = (index: number): string => {
  const prefix = randomItem(['AST', 'DEV', 'EQU', 'IT', 'OFF'])
  const year = randomInt(2020, 2026)
  const seq = String(index).padStart(4, '0')
  return `${prefix}-${year}-${seq}`
}

// 生成随机使用人
const generateUser = (): string => {
  if (Math.random() > 0.3) {
    return `${randomItem(surnames)}${randomItem(givenNames)}`
  }
  return ''
}

// 生成随机资产数据
const generateAssetData = (index: number) => {
  const name = generateName()
  const code = generateCode(index)
  const status = randomItem(statuses)
  const type1 = Math.random() > 0.3 ? randomItem(types) : ''
  const user = generateUser()
  const comment = randomItem(comments)

  const data: Record<string, string> = {}
  if (type1) data.type1 = type1
  if (user) data.user = user
  if (comment) data.comment = comment

  return {
    name,
    code,
    status,
    data
  }
}

// 主函数
async function main() {
  console.log('🚀 开始生成测试数据...\n')

  // 1. 获取现有资产数量
  const existingCount = await prisma.asset.count()
  console.log(`📊 现有资产: ${existingCount} 个\n`)

  // 2. 生成并创建资产
  console.log('📝 开始创建 200 个资产...\n')

  const assets = []
  for (let i = 0; i < 200; i++) {
    assets.push(generateAssetData(i + 1))
  }

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    try {
      await prisma.asset.create({
        data: {
          name: asset.name,
          code: asset.code,
          status: asset.status,
          data: JSON.stringify(asset.data),
        }
      })
      successCount++

      // 显示进度
      if ((i + 1) % 20 === 0) {
        console.log(`   📈 进度: ${i + 1}/200 (成功: ${successCount}, 失败: ${failCount})`)
      }
    } catch (err) {
      failCount++
      console.log(`   ❌ 失败 [${i + 1}]: ${asset.name} - ${err}`)
    }
  }

  // 3. 显示结果
  const finalCount = await prisma.asset.count()
  console.log('\n' + '='.repeat(50))
  console.log('✨ 数据生成完成!')
  console.log('='.repeat(50))
  console.log(`   ✅ 成功创建: ${successCount} 个资产`)
  console.log(`   ❌ 创建失败: ${failCount} 个资产`)
  console.log(`   📦 总资产数: ${finalCount} 个`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
