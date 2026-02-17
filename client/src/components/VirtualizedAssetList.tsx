/**
 * VirtualizedAssetList Component
 * Uses virtual scrolling for efficient rendering of large asset lists
 */

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Camera, Edit2, Trash2 } from 'lucide-react'
import { ASSET_STATUS_LABELS, hasPermission, getStoredUser } from '@/lib/api'
import type { Asset, AssetStatus, UserRole } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface VirtualizedAssetListProps {
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onUploadImage: (asset: Asset) => void
  onDelete: (asset: Asset) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

const statusStyles: Record<AssetStatus, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  IDLE: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  DAMAGED: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  SCRAPPED: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
}

export function VirtualizedAssetList({
  assets,
  onEdit,
  onUploadImage,
  onDelete,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: VirtualizedAssetListProps) {
  const navigate = useNavigate()
  const parentRef = useRef<HTMLDivElement>(null)

  const currentUser = getStoredUser()
  const canUpdate = hasPermission(currentUser?.role as UserRole, 'asset:update')
  const canDelete = hasPermission(currentUser?.role as UserRole, 'asset:delete')

  // Create virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: hasMore ? assets.length + 1 : assets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5, // Number of items to render outside visible area
  })

  // Load more when scrolling near bottom
  const lastItem = rowVirtualizer.getVirtualItems().at(-1)
  if (lastItem && lastItem.index >= assets.length - 1 && hasMore && !isLoading && onLoadMore) {
    onLoadMore()
  }

  if (assets.length === 0) {
    return null
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border rounded-lg"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > assets.length - 1
          const asset = assets[virtualRow.index]

          return (
            <motion.div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: virtualRow.index * 0.02 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn(
                'flex items-center justify-between px-4 py-3 border-b bg-background hover:bg-muted/50 transition-colors',
                virtualRow.index % 2 === 0 && 'bg-muted/20'
              )}
            >
              {isLoaderRow ? (
                <div className="flex items-center justify-center w-full py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Asset Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium flex-shrink-0">
                      {(asset.name || 'A').charAt(0).toUpperCase()}
                    </div>

                    {/* Name and Code */}
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="font-medium text-foreground hover:text-primary text-left truncate"
                      >
                        {asset.name}
                      </button>
                      <p className="text-sm text-muted-foreground truncate">
                        {asset.code || '—'}
                      </p>
                    </div>

                    {/* Status */}
                    <Badge
                      variant="secondary"
                      className={cn('flex-shrink-0', statusStyles[asset.status])}
                    >
                      {ASSET_STATUS_LABELS[asset.status]}
                    </Badge>

                    {/* Created Date */}
                    <span className="text-sm text-muted-foreground hidden md:block flex-shrink-0">
                      {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      title="查看详情"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onUploadImage(asset)}
                        title="添加照片"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onEdit(asset)}
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(asset)}
                        title="删除"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
