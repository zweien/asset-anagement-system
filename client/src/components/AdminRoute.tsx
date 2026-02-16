import { Navigate, useLocation } from 'react-router-dom'
import { getToken, getStoredUser } from '../lib/api'
import type { ReactNode } from 'react'

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation()
  const token = getToken()
  const user = getStoredUser()

  // 检查登录状态
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 检查管理员权限
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
