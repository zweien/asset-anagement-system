import { create } from 'zustand'
import { useAuthStore } from './authStore'

export type UserRole = 'ADMIN' | 'EDITOR' | 'USER'

interface PermissionState {
  // 计算属性
  isAdmin: () => boolean
  isEditor: () => boolean
  isUser: () => boolean
  canEdit: () => boolean  // 录入员及以上
  canView: () => boolean  // 所有认证用户
  canManageUsers: () => boolean  // 仅管理员

  // 权限检查
  hasRole: (roles: UserRole[]) => boolean
  checkPermission: (permission: string) => boolean
}

// 角色权重
const ROLE_WEIGHT: Record<UserRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  USER: 1,
}

// 权限映射
const PERMISSION_MAP: Record<string, UserRole[]> = {
  'asset:create': ['ADMIN', 'EDITOR'],
  'asset:edit': ['ADMIN', 'EDITOR'],
  'asset:delete': ['ADMIN', 'EDITOR'],
  'asset:view': ['ADMIN', 'EDITOR', 'USER'],
  'user:manage': ['ADMIN'],
  'field:manage': ['ADMIN', 'EDITOR'],
  'import:execute': ['ADMIN', 'EDITOR'],
  'export:execute': ['ADMIN', 'EDITOR', 'USER'],
  'log:view': ['ADMIN', 'EDITOR'],
}

export const usePermissionStore = create<PermissionState>(() => ({
  isAdmin: () => {
    const user = useAuthStore.getState().user
    return user?.role === 'ADMIN'
  },

  isEditor: () => {
    const user = useAuthStore.getState().user
    return user?.role === 'EDITOR'
  },

  isUser: () => {
    const user = useAuthStore.getState().user
    return user?.role === 'USER'
  },

  canEdit: () => {
    const user = useAuthStore.getState().user
    if (!user) return false
    return ROLE_WEIGHT[user.role as UserRole] >= ROLE_WEIGHT.EDITOR
  },

  canView: () => {
    const user = useAuthStore.getState().user
    return !!user
  },

  canManageUsers: () => {
    const user = useAuthStore.getState().user
    return user?.role === 'ADMIN'
  },

  hasRole: (roles) => {
    const user = useAuthStore.getState().user
    if (!user) return false
    return roles.includes(user.role as UserRole)
  },

  checkPermission: (permission) => {
    const user = useAuthStore.getState().user
    if (!user) return false

    const allowedRoles = PERMISSION_MAP[permission]
    if (!allowedRoles) return false

    return allowedRoles.includes(user.role as UserRole)
  },
}))

// 导出角色标签映射（兼容现有代码）
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '管理员',
  EDITOR: '录入员',
  USER: '普通用户',
}
