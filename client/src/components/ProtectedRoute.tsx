import { Navigate, useLocation } from 'react-router-dom'
import { getToken, getStoredUser } from '../lib/api'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = getToken()
  const user = getStoredUser()

  // 临时跳过认证检查（开发模式）
  // if (!token || !user) {
  //   // 重定向到登录页，保存当前路径
  //   return <Navigate to="/login" state={{ from: location }} replace />
  // }

  return <>{children}</>
}
