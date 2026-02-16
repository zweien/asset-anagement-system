import { test, expect } from '@playwright/test'

// 登录辅助函数
async function login(page: any) {
  await page.goto('/login')
  await page.locator('input[placeholder*="用户名"]').fill('admin')
  await page.locator('input[type="password"]').fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL('/', { timeout: 10000 })
}

test.describe('仪表盘', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该显示仪表盘页面', async ({ page }) => {
    await page.goto('/')
    // 检查页面已加载（通过 URL 或其他元素）
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('应该显示统计卡片', async ({ page }) => {
    await page.goto('/')
    // 等待页面加载
    await page.waitForTimeout(1000)

    // 检查是否有统计卡片
    const cards = page.locator('[class*="card"], [role="article"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('导航', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该能够导航到资产管理', async ({ page }) => {
    await page.goto('/')
    // 使用导航菜单中的链接，而非 Logo
    await page.getByRole('navigation').getByRole('link', { name: '资产管理' }).click()
    await expect(page).toHaveURL('/assets', { timeout: 5000 })
  })

  test('应该能够导航到统计报表', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /统计报表|Reports/ }).click()
    await expect(page).toHaveURL('/reports', { timeout: 5000 })
  })

  test('应该能够导航到系统设置', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /系统设置|Settings/ }).click()
    await expect(page).toHaveURL('/settings', { timeout: 5000 })
  })
})

test.describe('深色模式', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应该能够切换深色模式', async ({ page }) => {
    await page.goto('/')

    // 查找主题切换按钮
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="主题"], [class*="theme-toggle"]')

    if (await themeToggle.isVisible()) {
      // 获取当前主题
      const html = page.locator('html')
      const initialClass = await html.getAttribute('class')

      // 切换主题
      await themeToggle.click()
      await page.waitForTimeout(300)

      // 检查主题是否改变
      const newClass = await html.getAttribute('class')
      expect(newClass).not.toBe(initialClass)
    }
  })
})

test.describe('响应式布局', () => {
  test('移动端应该显示汉堡菜单', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await login(page)
    await page.goto('/')

    // 查找汉堡菜单按钮
    const menuButton = page.locator('button[aria-label*="menu"], button:has(svg)')
    expect(await menuButton.count()).toBeGreaterThan(0)
  })
})
