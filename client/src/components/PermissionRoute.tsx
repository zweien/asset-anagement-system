import { Navigate, useLocation } from 'react-router-dom'
import { getToken, getStoredUser, hasPermission, hasAnyPermission } from '../lib/api'
import type { ReactNode } from 'react'
import type { Permission, UserRole } from '../lib/api'

interface PermissionRouteProps {
  children: ReactNode
  permissions?: Permission[]
  anyPermissions?: Permission[]
  fallbackPath?: string
}

/**
 * 权限路由组件
 * - permissions: 需要拥有所有指定权限
 * - anyPermissions: 需要拥有任一权限
 */
export function PermissionRoute({
  children,
  permissions,
  anyPermissions,
  fallbackPath = '/',
}: PermissionRouteProps) {
  const location = useLocation()
  const token = getToken()
  const user = getStoredUser()

  // 检查登录状态
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 检查权限
  if (permissions) {
    const hasAll = permissions.every(p => hasPermission(user.role as UserRole, p))
    if (!hasAll) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  if (anyPermissions) {
    if (!hasAnyPermission(user.role as UserRole, anyPermissions)) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <>{children}</>
}

/**
 * 录入员及以上权限路由组件（管理员、录入员）
 */
export function EditorRoute({ children }: { children: ReactNode }) {
  return (
    <PermissionRoute anyPermissions={['asset:create', 'asset:update', 'asset:delete']}>
      {children}
    </PermissionRoute>
  )
}
