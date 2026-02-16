import { describe, it, expect, vi } from 'vitest'
import { AssetStatusEnum } from '../../services/asset.service'

// 测试资产状态枚举
describe('AssetService - 状态枚举', () => {
  it('应该包含所有有效的资产状态', () => {
    expect(AssetStatusEnum.ACTIVE).toBe('ACTIVE')
    expect(AssetStatusEnum.IDLE).toBe('IDLE')
    expect(AssetStatusEnum.DAMAGED).toBe('DAMAGED')
    expect(AssetStatusEnum.SCRAPPED).toBe('SCRAPPED')
  })

  it('应该有4个状态值', () => {
    expect(Object.keys(AssetStatusEnum)).toHaveLength(4)
  })
})

// 验证状态函数测试
describe('AssetService - 状态验证', () => {
  const VALID_STATUSES = Object.values(AssetStatusEnum)

  function validateStatus(status: string): boolean {
    return VALID_STATUSES.includes(status as AssetStatusEnum)
  }

  it('应该接受有效的状态', () => {
    expect(validateStatus('ACTIVE')).toBe(true)
    expect(validateStatus('IDLE')).toBe(true)
    expect(validateStatus('DAMAGED')).toBe(true)
    expect(validateStatus('SCRAPPED')).toBe(true)
  })

  it('应该拒绝无效的状态', () => {
    expect(validateStatus('active')).toBe(false)
    expect(validateStatus('PENDING')).toBe(false)
    expect(validateStatus('')).toBe(false)
    expect(validateStatus('RANDOM')).toBe(false)
  })
})

// 测试资产数据结构
describe('AssetService - 数据结构', () => {
  interface CreateAssetDto {
    name: string
    code?: string
    categoryId?: string
    status?: string
    data?: Record<string, unknown>
  }

  it('应该创建有效的资产 DTO', () => {
    const dto: CreateAssetDto = {
      name: '测试资产',
      code: 'AST001',
      status: 'ACTIVE',
      data: { customField: 'value' },
    }

    expect(dto.name).toBe('测试资产')
    expect(dto.code).toBe('AST001')
    expect(dto.status).toBe('ACTIVE')
    expect(dto.data).toEqual({ customField: 'value' })
  })

  it('最小资产 DTO 应该只有名称', () => {
    const dto: CreateAssetDto = {
      name: '最小资产',
    }

    expect(dto.name).toBe('最小资产')
    expect(dto.code).toBeUndefined()
    expect(dto.categoryId).toBeUndefined()
    expect(dto.status).toBeUndefined()
    expect(dto.data).toBeUndefined()
  })
})

// 测试分页参数
describe('AssetService - 分页参数', () => {
  interface AssetQueryParams {
    page?: number
    pageSize?: number
    search?: string
    categoryId?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: string
  }

  function getDefaultParams(params: AssetQueryParams): Required<Omit<AssetQueryParams, 'filters' | 'search' | 'categoryId' | 'status'>> & AssetQueryParams {
    return {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...params,
    }
  }

  it('应该提供默认的分页参数', () => {
    const params = getDefaultParams({})
    expect(params.page).toBe(1)
    expect(params.pageSize).toBe(20)
    expect(params.sortBy).toBe('createdAt')
    expect(params.sortOrder).toBe('desc')
  })

  it('应该覆盖自定义的分页参数', () => {
    const params = getDefaultParams({ page: 2, pageSize: 50, sortOrder: 'asc' })
    expect(params.page).toBe(2)
    expect(params.pageSize).toBe(50)
    expect(params.sortOrder).toBe('asc')
  })

  it('应该保留可选参数', () => {
    const params = getDefaultParams({ search: '测试', categoryId: 'cat-1' })
    expect(params.search).toBe('测试')
    expect(params.categoryId).toBe('cat-1')
  })
})
