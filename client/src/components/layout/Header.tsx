import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  Users,
  KeyRound,
  Check,
  XCircle
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { hasPermission, USER_ROLE_LABELS, type UserRole, authApi } from '../../lib/api'
import { showSuccess } from '../../lib/toast'
import { useAuthStore } from '@/stores/authStore'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// 密码复杂度验证函数
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('至少8位')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('包含小写字母')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('包含大写字母')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('包含数字')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 密码要求组件
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: '至少8位', valid: password.length >= 8 },
    { label: '包含小写字母', valid: /[a-z]/.test(password) },
    { label: '包含大写字母', valid: /[A-Z]/.test(password) },
    { label: '包含数字', valid: /[0-9]/.test(password) },
  ]

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          {req.valid ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-gray-400" />
          )}
          <span className={req.valid ? 'text-green-600' : 'text-muted-foreground'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}

interface NavItem {
  path: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: 'asset:create' | 'field:manage' | 'import:execute' | 'user:manage'
}

// 所有导航项定义
const allNavItems: NavItem[] = [
  { path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/assets', labelKey: 'nav.assets', icon: Package },
  { path: '/import', labelKey: 'nav.import', icon: Database, requiredPermission: 'import:execute' },
  { path: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { path: '/logs', labelKey: 'nav.logs', icon: FileText, requiredPermission: 'asset:create' },
  { path: '/settings', labelKey: 'nav.settings', icon: Settings, requiredPermission: 'field:manage' },
  { path: '/users', labelKey: 'nav.users', icon: Users, requiredPermission: 'user:manage' },
]

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  // 使用 Zustand store
  const { user, logout } = useAuthStore()

  // 根据用户权限动态生成导航项
  const navItems = useMemo(() => {
    if (!user) return allNavItems.filter(item => !item.requiredPermission)
    return allNavItems.filter(item => {
      if (!item.requiredPermission) return true
      return hasPermission(user.role as UserRole, item.requiredPermission)
    })
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 修改密码
  const handleChangePassword = async () => {
    setPasswordError('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }

    // 密码复杂度验证
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      setPasswordError(`密码不符合要求: 需要${passwordValidation.errors.join('、')}`)
      return
    }

    try {
      setPasswordSubmitting(true)
      const response = await authApi.changePassword(oldPassword, newPassword)
      if (response.success) {
        setShowChangePasswordModal(false)
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        showSuccess('密码修改成功')
      } else {
        setPasswordError(response.error || '密码修改失败')
      }
    } catch (err: any) {
      setPasswordError(err.message || '密码修改失败')
    } finally {
      setPasswordSubmitting(false)
    }
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
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
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
                <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  {t('users.changePassword')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
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
                        {t(item.labelKey)}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.changePassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="old-password">原密码 <span className="text-destructive">*</span></Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入原密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-new-password">新密码 <span className="text-destructive">*</span></Label>
              <Input
                id="header-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
              />
              {newPassword && <PasswordRequirements password={newPassword} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码 <span className="text-destructive">*</span></Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChangePasswordModal(false)
              setOldPassword('')
              setNewPassword('')
              setConfirmPassword('')
              setPasswordError('')
            }}>
              取消
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordSubmitting}>
              {passwordSubmitting ? '修改中...' : '确认修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
