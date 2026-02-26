import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Package,
  Settings,
  Database,
  BarChart3,
  FileText,
  Users,
  Github,
  ChevronDown,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { hasPermission, USER_ROLE_LABELS, type UserRole, authApi, systemConfigApi, avatarApi } from '../../lib/api'
import { API_BASE as API_BASE_CONFIG } from '../../lib/config'
import { APP_VERSION } from '../../lib/version'
import { showSuccess, showError } from '../../lib/toast'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { useRef, useEffect, useState } from 'react'
import { Camera, User, LogOut, KeyRound, Check, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_BASE = API_BASE_CONFIG

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

export function AppSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

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

  // 根据用户权限过滤导航项
  const navItems = user
    ? allNavItems.filter(item => {
        if (!item.requiredPermission) return true
        return hasPermission(user.role as UserRole, item.requiredPermission)
      })
    : allNavItems.filter(item => !item.requiredPermission)

  // 上传头像
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError(t('settings.invalidFileType'))
      return
    }

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

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  // 密码复杂度验证
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length < 8) errors.push(t('users.passwordReq8'))
    if (!/[a-z]/.test(password)) errors.push(t('users.passwordReqLower'))
    if (!/[A-Z]/.test(password)) errors.push(t('users.passwordReqUpper'))
    if (!/[0-9]/.test(password)) errors.push(t('users.passwordReqNumber'))
    return { valid: errors.length === 0, errors }
  }

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

  const handleLogout = () => {
    logout()
    // 使用 hash 路由兼容 Electron 的 file:// 协议
    window.location.hash = '#/login'
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className={`flex aspect-square size-8 items-center justify-center rounded-lg ${systemLogo ? 'bg-transparent' : 'bg-primary text-primary-foreground'}`}>
                    {systemLogo ? (
                      <img
                        src={`${API_BASE}${systemLogo}`}
                        alt={systemName || t('header.appName')}
                        className="size-8 rounded-lg object-contain"
                      />
                    ) : (
                      <Package className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {systemName || t('header.appName')}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <a
                    href="https://github.com/zweien/asset-anagement-system"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full"
                  >
                    <Github className="size-4" />
                    GitHub
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelKey)}>
                      <Link to={item.path}>
                        <Icon />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user?.avatar ? (
                      <AvatarImage src={`${API_BASE}${user.avatar}`} alt={user.name || user.username} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || user?.username}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role ? t(USER_ROLE_LABELS[user.role as UserRole]) : t('header.unknownRole')}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
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
          </SidebarMenuItem>
        </SidebarMenu>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        {/* 版本号显示 */}
        <div className="px-2 py-2 text-xs text-muted-foreground text-center border-t border-sidebar-border">
          v{APP_VERSION}
        </div>
      </SidebarFooter>
      <SidebarRail />

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
              <Label htmlFor="sidebar-old-password">{t('users.oldPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="sidebar-old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('header.oldPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sidebar-new-password">{t('users.newPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="sidebar-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('header.newPasswordPlaceholder')}
              />
              {newPassword && <PasswordRequirements password={newPassword} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sidebar-confirm-password">{t('users.confirmPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="sidebar-confirm-password"
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
    </Sidebar>
  )
}
