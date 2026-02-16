/**
 * 测试环境配置
 * 使用内存数据库或测试数据库进行测试
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// 加载测试环境变量
config({ path: resolve(__dirname, '../../.env.test') })

// 设置测试环境
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

// 全局测试超时
export const TEST_TIMEOUT = 10000

// 测试用户数据
export const testUsers = {
  admin: {
    id: 'test-admin-id',
    username: 'testadmin',
    password: 'TestAdmin123',
    name: '测试管理员',
    role: 'admin',
  },
  user: {
    id: 'test-user-id',
    username: 'testuser',
    password: 'TestUser123',
    name: '测试用户',
    role: 'user',
  },
}

// 测试资产数据
export const testAssets = {
  asset1: {
    id: 'test-asset-1',
    name: '测试资产1',
    serialNumber: 'SN001',
    status: '在用',
  },
  asset2: {
    id: 'test-asset-2',
    name: '测试资产2',
    serialNumber: 'SN002',
    status: '闲置',
  },
}
