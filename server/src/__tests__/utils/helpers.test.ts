import { describe, it, expect } from 'vitest'

/**
 * 基础测试用例 - 验证测试框架配置正确
 */
describe('测试框架验证', () => {
  it('Vitest 应该正常工作', () => {
    expect(1 + 1).toBe(2)
  })

  it('应该支持异步测试', async () => {
    const result = await Promise.resolve('async works')
    expect(result).toBe('async works')
  })

  it('应该支持对象比较', () => {
    const obj = { name: 'test', value: 123 }
    expect(obj).toEqual({ name: 'test', value: 123 })
  })

  it('应该支持数组操作', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})
