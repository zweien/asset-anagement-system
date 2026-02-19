import { Outlet, useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useKeyboard } from '@/hooks/useKeyboard'
import { ShortcutHelp } from '@/components/ui/shortcut-help'
import { useState } from 'react'

// 路由到面包屑的映射
const routeToBreadcrumb: Record<string, string> = {
  '/': 'nav.dashboard',
  '/assets': 'nav.assets',
  '/import': 'nav.import',
  '/reports': 'nav.reports',
  '/logs': 'nav.logs',
  '/settings': 'nav.settings',
  '/users': 'nav.users',
}

export function Layout() {
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)

  const breadcrumbKey = routeToBreadcrumb[location.pathname] || 'nav.dashboard'

  // 注册全局快捷键
  useKeyboard([
    { key: 'k', alt: true, handler: () => {
      // 跳转到资产页面并聚焦搜索框
      navigate('/assets?focus=search')
    }},
    { key: 'n', alt: true, handler: () => navigate('/assets?action=new') },
    { key: 'Escape', handler: () => setShortcutHelpOpen(false) },
    { key: '/', alt: true, handler: () => setShortcutHelpOpen(true) },
  ])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{t(breadcrumbKey)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 pt-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <ShortcutHelp open={shortcutHelpOpen} onOpenChange={setShortcutHelpOpen} />
    </SidebarProvider>
  )
}
