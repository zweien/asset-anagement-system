/**
 * MobileBottomNav Component
 * A mobile-friendly bottom navigation bar
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Users,
  FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasPermission, getStoredUser, type Permission } from '@/lib/api'
import type { UserRole } from '@/lib/api'

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  requiredPermission?: Permission
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: '首页',
    icon: LayoutDashboard,
  },
  {
    path: '/assets',
    label: '资产',
    icon: Package,
  },
  {
    path: '/reports',
    label: '报表',
    icon: BarChart3,
  },
  {
    path: '/logs',
    label: '日志',
    icon: FileText,
  },
  {
    path: '/users',
    label: '用户',
    icon: Users,
    adminOnly: true,
  },
  {
    path: '/settings',
    label: '设置',
    icon: Settings,
  },
]

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = getStoredUser()

  // Filter navigation items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && currentUser?.role !== 'ADMIN') {
      return false
    }
    if (item.requiredPermission && !hasPermission(currentUser?.role as UserRole, item.requiredPermission)) {
      return false
    }
    return true
  })

  // Only show on mobile screens
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isActive && 'scale-110'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isActive && 'text-primary'
                )}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
