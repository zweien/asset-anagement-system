/**
 * 重置管理员密码脚本
 * 用法: npx tsx src/scripts/reset-admin.ts [新密码]
 * 如果不提供密码，默认使用 admin123
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  const newPassword = process.argv[2] || 'admin123'

  try {
    // 检查 admin 用户是否存在
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!admin) {
      console.log('❌ admin 用户不存在，正在创建...')
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: '管理员',
          role: 'ADMIN',
        },
      })
      console.log('✅ admin 用户已创建')
    } else {
      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { username: 'admin' },
        data: { password: hashedPassword },
      })
      console.log('✅ admin 密码已重置')
    }

    console.log('===========================================')
    console.log('  用户名: admin')
    console.log(`  密码: ${newPassword}`)
    console.log('  ⚠️  请登录后立即修改密码！')
    console.log('===========================================')
  } catch (error) {
    console.error('❌ 重置密码失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
