import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import {
  LayoutDashboard,
  Package,
  Settings,
  Database,
  BarChart3,
  Menu,
  FileText,
  LogOut,
  User,
  Users
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { getStoredUser, removeToken, removeUser, hasPermission, USER_ROLE_LABELS, type UserRole } from '../../lib/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: 'asset:create' | 'field:manage' | 'import:execute' | 'user:manage'
}

// 所有导航项定义
const allNavItems: NavItem[] = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/assets', label: '资产管理', icon: Package },
  { path: '/import', label: '数据导入', icon: Database, requiredPermission: 'import:execute' },
  { path: '/reports', label: '统计报表', icon: BarChart3 },
  { path: '/logs', label: '操作日志', icon: FileText, requiredPermission: 'asset:create' },
  { path: '/settings', label: '系统设置', icon: Settings, requiredPermission: 'field:manage' },
  { path: '/users', label: '用户管理', icon: Users, requiredPermission: 'user:manage' },
]

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = getStoredUser()

  // 根据用户权限动态生成导航项
  const navItems = useMemo(() => {
    if (!user) return allNavItems.filter(item => !item.requiredPermission)
    return allNavItems.filter(item => {
      if (!item.requiredPermission) return true
      return hasPermission(user.role as UserRole, item.requiredPermission)
    })
  }, [user])

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/login')
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              资产管理
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || user?.username || '用户'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role ? USER_ROLE_LABELS[user.role as UserRole] : '未知角色'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>导航菜单</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
