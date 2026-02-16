import { useState, useEffect } from 'react'
import {
  userApi,
  USER_ROLE_LABELS,
  type UserRole,
  type UserListItem,
  type UserQueryParams,
  type CreateUserDto,
  type UpdateUserDto,
} from '../lib/api'
import { Plus, Pencil, Trash2, Key, UserCheck, UserX, X, Search, RotateCcw } from 'lucide-react'
import { PageInstructions } from '@/components/PageInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  useEffect(() => {
    loadUsers()
  }, [page, filterRole, filterActive])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params: UserQueryParams = { page, pageSize }

      if (search) params.search = search
      if (filterRole) params.role = filterRole
      if (filterActive !== '') params.active = filterActive === 'true'

      const response: any = await userApi.getAll(params)
      if (response?.success) {
        setUsers(response.data.data)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      console.error('加载用户列表失败:', err)
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
      setFormError('用户名为必填字段')
      return
    }
    if (!formData.password) {
      setFormError('密码为必填字段')
      return
    }
    if (formData.password.length < 6) {
      setFormError('密码长度至少为6位')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const response: any = await userApi.create(formData)
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
        setFormError(response?.error || '创建失败')
      }
    } catch (err: any) {
      setFormError(err.message || '创建失败')
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
      const response: any = await userApi.update(selectedUser.id, editFormData)
      if (response?.success) {
        setShowEditModal(false)
        setSelectedUser(null)
        setEditFormData({})
        loadUsers()
      } else {
        setFormError(response?.error || '更新失败')
      }
    } catch (err: any) {
      setFormError(err.message || '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 切换角色
  const handleRoleChange = async (user: UserListItem, newRole: UserRole) => {
    if (user.role === newRole) return

    try {
      const response: any = await userApi.updateRole(user.id, newRole)
      if (response?.success) {
        loadUsers()
      } else {
        alert(response?.error || '角色更新失败')
      }
    } catch (err: any) {
      alert(err.message || '角色更新失败')
    }
  }

  // 切换状态
  const handleToggleStatus = async (user: UserListItem) => {
    try {
      const response: any = await userApi.updateStatus(user.id, !user.active)
      if (response?.success) {
        loadUsers()
      } else {
        alert(response?.error || '状态更新失败')
      }
    } catch (err: any) {
      alert(err.message || '状态更新失败')
    }
  }

  // 重置密码
  const handleResetPassword = async () => {
    if (!selectedUser) return
    if (!newPassword) {
      setFormError('密码为必填字段')
      return
    }
    if (newPassword.length < 6) {
      setFormError('密码长度至少为6位')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const response: any = await userApi.resetPassword(selectedUser.id, newPassword)
      if (response?.success) {
        setShowResetPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        setFormError(response?.error || '密码重置失败')
      }
    } catch (err: any) {
      setFormError(err.message || '密码重置失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除用户
  const handleDelete = async (user: UserListItem) => {
    if (!confirm(`确定要删除用户 "${user.name || user.username}" 吗？此操作不可恢复。`)) {
      return
    }

    try {
      const response: any = await userApi.delete(user.id)
      if (response?.success) {
        loadUsers()
      } else {
        alert(response?.error || '删除失败')
      }
    } catch (err: any) {
      alert(err.message || '删除失败')
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
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <p className="mt-1 text-muted-foreground">管理系统用户和权限</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title="用户管理说明"
        instructions={[
          '管理员可以创建、编辑和删除用户',
          '点击角色下拉框可以直接修改用户角色',
          '点击状态按钮可以启用或禁用用户',
          '使用搜索框和筛选条件可以快速查找用户',
          '重置密码功能可以为用户设置新密码'
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
                placeholder="搜索用户名、姓名或邮箱..."
                className="pl-10"
              />
            </div>

            {/* 角色筛选 */}
            <Select value={filterRole || "__all__"} onValueChange={(v) => { setFilterRole(v === "__all__" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部角色</SelectItem>
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select value={filterActive || "__all__"} onValueChange={(v) => { setFilterActive(v === "__all__" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部状态</SelectItem>
                <SelectItem value="true">已启用</SelectItem>
                <SelectItem value="false">已禁用</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        {loading ? (
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">加载中...</p>
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">暂无用户数据</p>
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
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
                            <SelectItem key={value} value={value}>{label}</SelectItem>
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
                            已启用
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            已禁用
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => openEditModal(user)} title="编辑">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowResetPasswordModal(true)
                          }}
                          title="重置密码"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(user)}
                          title="删除"
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
                共 {total} 条记录
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  上一页
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
                  下一页
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
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">用户名 <span className="text-destructive">*</span></Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码 <span className="text-destructive">*</span></Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码（至少6位）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setFormError('') }}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户弹窗 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input
                value={selectedUser?.username || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="请输入邮箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">角色</Label>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); setFormError('') }}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码弹窗 */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {formError}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              为用户 <span className="font-medium text-foreground">{selectedUser?.name || selectedUser?.username}</span> 设置新密码
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码 <span className="text-destructive">*</span></Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetPasswordModal(false); setFormError(''); setNewPassword('') }}>
              取消
            </Button>
            <Button onClick={handleResetPassword} disabled={submitting}>
              {submitting ? '重置中...' : '确认重置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
