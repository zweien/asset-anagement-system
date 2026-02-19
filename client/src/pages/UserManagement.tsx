import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  userApi,
  USER_ROLE_LABELS,
  type UserRole,
  type UserListItem,
  type UserQueryParams,
  type CreateUserDto,
  type UpdateUserDto,
  type UserImportResult,
} from '../lib/api'
import { showSuccess, showError } from '../lib/toast'
import { Plus, Pencil, Trash2, Key, UserCheck, UserX, Search, RotateCcw, Check, XCircle, Download, Upload } from 'lucide-react'
import { PageInstructions } from '@/components/PageInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function UserManagement() {
  const { t } = useTranslation()

  // 密码复杂度验证函数
  function validatePassword(password: string): { valid: boolean; errors: string[] } {
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
  function PasswordRequirements({ password }: { password: string }) {
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
  // 列表数据
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // 筛选条件
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterActive, setFilterActive] = useState('')

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

  // 表单数据
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'USER',
  })
  const [editFormData, setEditFormData] = useState<UpdateUserDto>({})
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 导入相关状态
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<UserImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterRole, filterActive])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params: UserQueryParams = { page, pageSize }

      if (search) params.search = search
      if (filterRole) params.role = filterRole
      if (filterActive !== '') params.active = filterActive === 'true'

      const response = await userApi.getAll(params)
      if (response?.success) {
        setUsers(response.data.data)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      console.error(t('users.loadFailed'), err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadUsers()
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilterRole('')
    setFilterActive('')
    setPage(1)
  }

  // 创建用户
  const handleCreate = async () => {
    if (!formData.username.trim()) {
      setFormError(t('users.usernameRequired'))
      return
    }
    if (!formData.password) {
      setFormError(t('users.passwordRequired'))
      return
    }

    // 密码复杂度验证
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setFormError(`${t('users.passwordInvalid')}${passwordValidation.errors.join('、')}`)
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const response = await userApi.create(formData)
      if (response?.success) {
        setShowCreateModal(false)
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'USER',
        })
        loadUsers()
      } else {
        setFormError((response as { error?: string })?.error || t('users.createFailed'))
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('users.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 编辑用户
  const handleEdit = async () => {
    if (!selectedUser) return

    try {
      setSubmitting(true)
      setFormError('')
      const response = await userApi.update(selectedUser.id, editFormData)
      if (response?.success) {
        setShowEditModal(false)
        setSelectedUser(null)
        setEditFormData({})
        loadUsers()
      } else {
        setFormError((response as { error?: string })?.error || t('users.updateFailed'))
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('users.updateFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 切换角色
  const handleRoleChange = async (user: UserListItem, newRole: UserRole) => {
    if (user.role === newRole) return

    try {
      const response = await userApi.updateRole(user.id, newRole)
      if (response?.success) {
        showSuccess(t('users.roleUpdateSuccess'))
        loadUsers()
      } else {
        showError(t('users.roleUpdateFailed'), (response as { error?: string })?.error || t('users.unknownError'))
      }
    } catch (err: unknown) {
      showError(t('users.roleUpdateFailed'), err instanceof Error ? err.message : t('users.unknownError'))
    }
  }

  // 切换状态
  const handleToggleStatus = async (user: UserListItem) => {
    try {
      const response = await userApi.updateStatus(user.id, !user.active)
      if (response?.success) {
        showSuccess(user.active ? t('users.userDeactivated') : t('users.userActivated'))
        loadUsers()
      } else {
        showError(t('users.statusUpdateFailed'), (response as { error?: string })?.error || t('users.unknownError'))
      }
    } catch (err: unknown) {
      showError(t('users.statusUpdateFailed'), err instanceof Error ? err.message : t('users.unknownError'))
    }
  }

  // 重置密码
  const handleResetPassword = async () => {
    if (!selectedUser) return
    if (!newPassword) {
      setFormError(t('users.passwordRequired'))
      return
    }

    // 密码复杂度验证
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      setFormError(`${t('users.passwordInvalid')}${passwordValidation.errors.join('、')}`)
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const response = await userApi.resetPassword(selectedUser.id, newPassword)
      if (response?.success) {
        setShowResetPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        setFormError((response as { error?: string })?.error || t('users.resetPasswordFailed'))
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('users.resetPasswordFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除用户
  const handleDelete = async (user: UserListItem) => {
    if (!confirm(t('users.confirmDeleteUser', { name: user.name || user.username }))) {
      return
    }

    try {
      const response = await userApi.delete(user.id)
      if (response?.success) {
        showSuccess(t('users.userDeleteSuccess'))
        loadUsers()
      } else {
        showError(t('users.deleteFailed'), (response as { error?: string })?.error || t('users.unknownError'))
      }
    } catch (err: unknown) {
      showError(t('users.deleteFailed'), err instanceof Error ? err.message : t('users.unknownError'))
    }
  }

  // 下载用户导入模板
  const handleDownloadTemplate = async () => {
    try {
      await userApi.downloadTemplate()
      showSuccess(t('users.templateDownloadSuccess'))
    } catch (err) {
      showError(t('users.templateDownloadFailed'), err instanceof Error ? err.message : t('users.unknownError'))
    }
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
    }
  }

  // 执行导入
  const handleImport = async () => {
    if (!importFile) {
      showError(t('users.pleaseSelectFile'))
      return
    }

    try {
      setImporting(true)
      const result = await userApi.importUsers(importFile)
      setImportResult(result)

      if (result.success && result.data) {
        showSuccess(t('users.importSuccess', {
          success: result.data.success,
          failed: result.data.failed
        }))
        if (result.data.success > 0) {
          loadUsers()
        }
      } else {
        showError(t('users.importFailed'), result.error || t('users.unknownError'))
      }
    } catch (err) {
      showError(t('users.importFailed'), err instanceof Error ? err.message : t('users.unknownError'))
    } finally {
      setImporting(false)
    }
  }

  // 关闭导入对话框
  const handleCloseImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openEditModal = (user: UserListItem) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role,
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('users.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            {t('users.importUsers')}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('users.addUser')}
          </Button>
        </div>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title={t('users.instructionsTitle')}
        instructions={[
          t('users.instruction1'),
          t('users.instruction2'),
          t('users.instruction3'),
          t('users.instruction4'),
          t('users.instruction5'),
        ]}
      />

      {/* 筛选条件 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('users.searchPlaceholder')}
                className="pl-10"
              />
            </div>

            {/* 角色筛选 */}
            <Select value={filterRole || "__all__"} onValueChange={(v) => { setFilterRole(v === "__all__" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('users.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('users.allRoles')}</SelectItem>
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{t(label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select value={filterActive || "__all__"} onValueChange={(v) => { setFilterActive(v === "__all__" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('users.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('users.allStatus')}</SelectItem>
                <SelectItem value="true">{t('users.statusActive')}</SelectItem>
                <SelectItem value="false">{t('users.statusInactive')}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>{t('common.search')}</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('users.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        {loading ? (
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('users.noUsers')}</p>
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.user')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('users.status')}</TableHead>
                  <TableHead>{t('users.createdAtLabel')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name || user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.username}
                            {user.email && ` · ${user.email}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user, v as UserRole)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{t(label)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        className={`h-8 ${
                          user.active
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        {user.active ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            {t('users.statusActive')}
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            {t('users.statusInactive')}
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => openEditModal(user)} title={t('common.edit')}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowResetPasswordModal(true)
                          }}
                          title={t('users.resetPassword')}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(user)}
                          title={t('common.delete')}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 分页 */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                {t('users.totalRecords', { count: total })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  {t('users.prevPage')}
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  {t('users.nextPage')}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* 创建用户弹窗 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.addUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">{t('users.username')} <span className="text-destructive">*</span></Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('users.usernamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')} <span className="text-destructive">*</span></Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('users.passwordPlaceholder')}
              />
              {formData.password && <PasswordRequirements password={formData.password} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('users.name')}</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('users.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('users.emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('users.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('users.rolePermissionsNote')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setFormError('') }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? t('users.creating') : t('users.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户弹窗 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.editUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('users.username')}</Label>
              <Input
                value={selectedUser?.username || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('users.name')}</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder={t('users.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('users.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder={t('users.emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t('users.role')}</Label>
              <Select
                value={editFormData.role || selectedUser?.role}
                onValueChange={(v) => setEditFormData({ ...editFormData, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('users.rolePermissionsNote')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); setFormError('') }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? t('users.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码弹窗 */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.resetPassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {t('users.resetPasswordFor', { name: selectedUser?.name || selectedUser?.username })}
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('users.newPassword')} <span className="text-destructive">*</span></Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('users.newPasswordPlaceholder')}
              />
              {newPassword && <PasswordRequirements password={newPassword} />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetPasswordModal(false); setFormError(''); setNewPassword('') }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleResetPassword} disabled={submitting}>
              {submitting ? t('users.resetting') : t('users.confirmReset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入用户对话框 */}
      <Dialog open={showImportModal} onOpenChange={handleCloseImportModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('users.importUsers')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 步骤说明 */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</div>
                <span className="text-sm">{t('users.importStep1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</div>
                <span className="text-sm">{t('users.importStep2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</div>
                <span className="text-sm">{t('users.importStep3')}</span>
              </div>
            </div>

            {/* 下载模板 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{t('users.downloadTemplate')}</p>
                <p className="text-sm text-muted-foreground">{t('users.downloadTemplateDesc')}</p>
              </div>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                {t('users.download')}
              </Button>
            </div>

            {/* 文件上传 */}
            <div className="space-y-2">
              <Label>{t('users.selectFile')}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {importFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">{importFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImportFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      {t('common.remove')}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('users.selectExcelFile')}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {t('users.supportedFormats')}: .xlsx, .xls
                </p>
              </div>
            </div>

            {/* 导入结果 */}
            {importResult && (
              <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <p className="font-medium mb-2">{t('users.importResult')}</p>
                {importResult.data && (
                  <div className="text-sm space-y-1">
                    <p className="text-green-600 dark:text-green-400">
                      {t('users.importSuccessCount')}: {importResult.data.success}
                    </p>
                    <p className="text-red-600 dark:text-red-400">
                      {t('users.importFailedCount')}: {importResult.data.failed}
                    </p>
                    {importResult.data.errors.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        <p className="font-medium">{t('users.errorDetails')}:</p>
                        <ul className="list-disc list-inside text-xs">
                          {importResult.data.errors.map((err, idx) => (
                            <li key={idx}>
                              {t('users.row')} {err.row}: {err.username ? `${err.username} - ` : ''}{err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {importResult.error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{importResult.error}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImportModal}>
              {t('common.close')}
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? t('users.importing') : t('users.startImport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
