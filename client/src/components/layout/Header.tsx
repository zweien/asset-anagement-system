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
  XCircle,
  Camera,
  Github
} from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { hasPermission, USER_ROLE_LABELS, type UserRole, authApi, systemConfigApi, avatarApi } from '../../lib/api'
import { showSuccess, showError } from '../../lib/toast'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const API_BASE = 'http://localhost:3002'

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
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // 使用 Zustand store
  const { user, logout, refreshUser } = useAuthStore()

  // 加载系统配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await systemConfigApi.getPublicConfig()
        if (response.success) {
          setSystemLogo(response.data.logo)
          setSystemName(response.data.name)
        }
      } catch (err) {
        console.error('加载系统配置失败:', err)
      }
    }
    loadConfig()
  }, [])

  // 上传头像
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError(t('settings.invalidFileType'))
      return
    }

    // 验证文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError(t('settings.fileTooLarge'))
      return
    }

    try {
      const response = await avatarApi.upload(file)
      if (response.success) {
        refreshUser()
        showSuccess(t('settings.avatarUploadSuccess'))
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('settings.avatarUploadFailed'))
    }

    // 清空 input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  // 密码复杂度验证函数
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push(t('users.passwordReq8'))
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('users.passwordReqLower'))
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('users.passwordReqUpper'))
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('users.passwordReqNumber'))
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // 密码要求组件
  const PasswordRequirements = ({ password }: { password: string }) => {
    const requirements = [
      { label: t('users.passwordReq8'), valid: password.length >= 8 },
      { label: t('users.passwordReqLower'), valid: /[a-z]/.test(password) },
      { label: t('users.passwordReqUpper'), valid: /[A-Z]/.test(password) },
      { label: t('users.passwordReqNumber'), valid: /[0-9]/.test(password) },
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
      setPasswordError(t('users.allFieldsRequired'))
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('header.passwordMismatch'))
      return
    }

    // 密码复杂度验证
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      setPasswordError(`${t('users.passwordInvalid')}${passwordValidation.errors.join('、')}`)
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
        showSuccess(t('users.passwordChangeSuccess'))
      } else {
        setPasswordError(response.error || t('header.passwordChangeFailed'))
      }
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : t('header.passwordChangeFailed'))
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
            {systemLogo ? (
              <img
                src={`${API_BASE}${systemLogo}`}
                alt={systemName || t('header.appName')}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Package className="w-8 h-8 text-primary" />
            )}
            <span className="text-xl font-bold text-foreground">
              {systemName || t('header.appName')}
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
            <a
              href="https://github.com/zweien/asset-anagement-system"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    {user?.avatar ? (
                      <AvatarImage src={`${API_BASE}${user.avatar}`} alt={user.name || user.username} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || user?.username || t('header.user')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role ? t(USER_ROLE_LABELS[user.role as UserRole]) : t('header.unknownRole')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => avatarInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  {t('settings.uploadAvatar')}
                </DropdownMenuItem>
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

            {/* 隐藏的头像上传 input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>{t('header.navMenu')}</SheetTitle>
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
                  <a
                    href="https://github.com/zweien/asset-anagement-system"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
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
              <Label htmlFor="old-password">{t('users.oldPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('header.oldPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-new-password">{t('users.newPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="header-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('header.newPasswordPlaceholder')}
              />
              {newPassword && <PasswordRequirements password={newPassword} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('users.confirmPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('header.confirmPasswordPlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordSubmitting}>
              {passwordSubmitting ? t('header.changing') : t('header.confirmChange')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
