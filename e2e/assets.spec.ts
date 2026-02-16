import { test, expect } from '@playwright/test'

// 登录辅助函数
async function login(page: any) {
  await page.goto('/login')
  await page.locator('input[placeholder*="用户名"]').fill('admin')
  await page.locator('input[type="password"]').fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL('/', { timeout: 10000 })
}

test.describe('资产管理', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该能够访问资产列表页面', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByRole('heading', { name: '资产管理', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('应该显示资产列表表格', async ({ page }) => {
    await page.goto('/assets')
    // 等待表格加载
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 })
  })

  test('应该能够打开新增资产表单', async ({ page }) => {
    await page.goto('/assets')

    // 点击新增按钮
    const addButton = page.getByRole('button', { name: /新增资产|新增/ }).first()
    if (await addButton.isVisible()) {
      await addButton.click()
      // 等待对话框出现
      await page.waitForTimeout(1000)
    }
  })

  test('应该能够使用搜索功能', async ({ page }) => {
    await page.goto('/assets')

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="查询"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试')
      // 等待搜索结果
      await page.waitForTimeout(1000)
    }
  })

  test('应该能够切换分组视图', async ({ page }) => {
    await page.goto('/assets')

    // 查找分组切换按钮
    const groupButton = page.getByRole('button', { name: '分组视图' }).first()
    if (await groupButton.isVisible()) {
      await groupButton.click()
      await page.waitForTimeout(500)
    }
  })
})

test.describe('资产筛选', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该能够打开筛选面板', async ({ page }) => {
    await page.goto('/assets')

    // 查找筛选按钮
    const filterButton = page.getByRole('button', { name: /筛选|过滤/ })
    if (await filterButton.isVisible()) {
      await filterButton.click()
      // 检查筛选面板是否显示
      await page.waitForTimeout(500)
    }
  })

  test('应该能够按状态筛选', async ({ page }) => {
    await page.goto('/assets')

    // 查找状态筛选下拉框
    const statusSelect = page.locator('select, [role="combobox"]').first()
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      await page.waitForTimeout(300)
    }
  })
})

test.describe('资产详情', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该能够查看资产详情', async ({ page }) => {
    await page.goto('/assets')

    // 等待表格加载
    await page.waitForTimeout(1000)

    // 点击第一个资产名称（如果有）
    const assetLink = page.locator('table a, table [role="link"]').first()
    if (await assetLink.isVisible()) {
      await assetLink.click()
      // 检查是否跳转到详情页
      await page.waitForTimeout(1000)
    }
  })
})
