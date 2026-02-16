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

      const response = await userApi.getAll(params)
      if (response.success) {
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
      const response = await userApi.create(formData)
      if (response.success) {
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
        setFormError((response as any).error || '创建失败')
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
      const response = await userApi.update(selectedUser.id, editFormData)
      if (response.success) {
        setShowEditModal(false)
        setSelectedUser(null)
        setEditFormData({})
        loadUsers()
      } else {
        setFormError((response as any).error || '更新失败')
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
      const response = await userApi.updateRole(user.id, newRole)
      if (response.success) {
        loadUsers()
      } else {
        alert((response as any).error || '角色更新失败')
      }
    } catch (err: any) {
      alert(err.message || '角色更新失败')
    }
  }

  // 切换状态
  const handleToggleStatus = async (user: UserListItem) => {
    try {
      const response = await userApi.updateStatus(user.id, !user.active)
      if (response.success) {
        loadUsers()
      } else {
        alert((response as any).error || '状态更新失败')
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
      const response = await userApi.resetPassword(selectedUser.id, newPassword)
      if (response.success) {
        setShowResetPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        setFormError((response as any).error || '密码重置失败')
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
      const response = await userApi.delete(user.id)
      if (response.success) {
        loadUsers()
      } else {
        alert((response as any).error || '删除失败')
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

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMIN: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
      USER: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      VIEWER: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[role] || ''
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">管理系统用户和权限</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加用户
        </button>
      </div>

      {/* 筛选条件 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-4">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索用户名、姓名或邮箱..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 角色筛选 */}
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">全部角色</option>
            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* 状态筛选 */}
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">全部状态</option>
            <option value="true">已启用</option>
            <option value="false">已禁用</option>
          </select>

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            搜索
          </button>

          {/* 清除筛选 */}
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">暂无用户数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || user.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                              {user.email && ` · ${user.email}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getRoleColor(user.role)}`}
                        >
                          {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            user.active
                              ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                              : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {user.active ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              已启用
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              已禁用
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                            title="编辑"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowResetPasswordModal(true)
                            }}
                            className="p-1 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400"
                            title="重置密码"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                共 {total} 条记录
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 创建用户弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">添加用户</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormError('')
                  setFormData({
                    username: '',
                    password: '',
                    name: '',
                    email: '',
                    role: 'USER',
                  })
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入密码（至少6位）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  角色
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormError('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户弹窗 */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">编辑用户</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setFormError('')
                  setSelectedUser(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={selectedUser.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  角色
                </label>
                <select
                  value={editFormData.role || selectedUser.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setFormError('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEdit}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">重置密码</h3>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false)
                  setFormError('')
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  {formError}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                为用户 <span className="font-medium text-gray-900 dark:text-white">{selectedUser.name || selectedUser.username}</span> 设置新密码
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false)
                  setFormError('')
                  setNewPassword('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleResetPassword}
                disabled={submitting}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '重置中...' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
