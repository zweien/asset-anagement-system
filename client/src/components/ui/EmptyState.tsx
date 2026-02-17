/**
 * EmptyState Component
 * A friendly, animated empty state display with optional action
 */

import { motion } from 'framer-motion'
import { Package, Search, FileText, Users, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: {
    iconWrapper: 'w-12 h-12',
    icon: 'w-6 h-6',
    title: 'text-base',
    description: 'text-sm',
    padding: 'py-8',
  },
  md: {
    iconWrapper: 'w-16 h-16',
    icon: 'w-8 h-8',
    title: 'text-lg',
    description: 'text-sm',
    padding: 'py-12',
  },
  lg: {
    iconWrapper: 'w-20 h-20',
    icon: 'w-10 h-10',
    title: 'text-xl',
    description: 'text-base',
    padding: 'py-16',
  },
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        config.padding,
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 200 }}
        className={cn(
          'rounded-full bg-muted flex items-center justify-center mb-4',
          config.iconWrapper
        )}
      >
        <Icon className={cn('text-muted-foreground', config.icon)} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className={cn('font-semibold text-foreground mb-2', config.title)}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className={cn('text-muted-foreground max-w-sm mb-6', config.description)}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
        >
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Preset empty states for common use cases
interface EmptyStatePresetProps {
  onAction?: () => void
  actionLabel?: string
  className?: string
}

export function EmptyAssets({ onAction, actionLabel, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={Package}
      title="暂无资产数据"
      description="开始添加您的第一个资产记录，或从 Excel/数据库导入现有数据"
      action={onAction ? { label: actionLabel || '添加资产', onClick: onAction } : undefined}
      className={className}
    />
  )
}

export function EmptySearch({ searchTerm, className }: { searchTerm?: string; className?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="未找到匹配结果"
      description={searchTerm ? `没有找到与"${searchTerm}"相关的资产` : '没有找到符合条件的资产'}
      size="sm"
      className={className}
    />
  )
}

export function EmptyLogs({ className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={FileText}
      title="暂无操作日志"
      description="系统操作记录将显示在这里"
      size="sm"
      className={className}
    />
  )
}

export function EmptyUsers({ onAction, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={Users}
      title="暂无用户"
      description="添加用户以开始管理系统访问权限"
      action={onAction ? { label: '添加用户', onClick: onAction } : undefined}
      className={className}
    />
  )
}

export function EmptyReports({ className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title="暂无报表数据"
      description="添加资产后将自动生成统计报表"
      size="sm"
      className={className}
    />
  )
}
