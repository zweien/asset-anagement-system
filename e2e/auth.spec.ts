import { test, expect } from '@playwright/test'

test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('应该显示登录表单', async ({ page }) => {
    await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('登录失败应该显示错误信息', async ({ page }) => {
    await page.locator('input[placeholder*="用户名"]').fill('wronguser')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: '登录' }).click()

    // 等待错误信息出现
    await expect(page.locator('text=用户名或密码错误')).toBeVisible({ timeout: 5000 })
  })

  test('成功登录应该跳转到首页', async ({ page }) => {
    // 使用默认管理员账户
    await page.locator('input[placeholder*="用户名"]').fill('admin')
    await page.locator('input[type="password"]').fill('admin123')
    await page.getByRole('button', { name: '登录' }).click()

    // 等待跳转到首页
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('应该能够切换到注册表单', async ({ page }) => {
    await page.getByRole('button', { name: '立即注册' }).click()

    await expect(page.locator('text=创建新账户')).toBeVisible()
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible()
  })
})

test.describe('认证守卫', () => {
  test('未登录访问受保护页面应该跳转到登录页', async ({ page }) => {
    await page.goto('/assets')
    // 应该被重定向到登录页
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })
})
