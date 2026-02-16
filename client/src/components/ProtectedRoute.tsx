import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // 临时跳过认证检查（开发模式）
  // 如需启用认证，取消注释以下代码
  // import { Navigate, useLocation } from 'react-router-dom'
  // import { getToken, getStoredUser } from '../lib/api'
  // const location = useLocation()
  // const token = getToken()
  // const user = getStoredUser()
  // if (!token || !user) {
  //   return <Navigate to="/login" state={{ from: location }} replace />
  // }

  return <>{children}</>
}
