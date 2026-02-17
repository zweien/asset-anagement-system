import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState, VisibilityState, RowSelectionState } from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Plus, Search, RefreshCw, Filter, X, Edit2, Trash2, Download, LayoutGrid, List, ChevronRight as ChevronRightIcon, Camera, ExternalLink } from 'lucide-react'
import { assetApi, fieldApi, ASSET_STATUS_LABELS, hasPermission, getStoredUser } from '../lib/api'
import type { Asset, FieldConfig, FieldType, GroupedAssets, AssetStatus, UserRole } from '../lib/api'
import { AssetForm } from '../components/AssetForm'
import { ImageUploader } from '../components/ImageUploader'
import { PageInstructions } from '@/components/PageInstructions'
import { TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { EmptyAssets, EmptySearch } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const API_BASE = 'http://localhost:3002/api'

// 图片上传模态框组件
interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  assetId: string
  assetName: string
  onSuccess: () => void
}

interface ImageInfo {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt: string
}

function ImageUploadModal({ isOpen, onClose, assetId, assetName, onSuccess }: ImageUploadModalProps) {
  const { t } = useTranslation()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [_loading, setLoading] = useState(false)

  const loadImages = async () => {
    if (!assetId) return
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/assets/${assetId}/images`)
      const result = await response.json()
      if (result.success) {
        setImages(result.data)
      }
    } catch (err) {
      console.error('加载图片失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && assetId) {
      loadImages()
    }
  }, [isOpen, assetId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('assets.addPhoto')} - {assetName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ImageUploader
            assetId={assetId}
            images={images}
            onImagesChange={() => {
              loadImages()
              onSuccess()
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const columnHelper = createColumnHelper<Asset>()

// 筛选操作符类型
type FilterOperator =
  | 'contains'    // 包含
  | 'notContains' // 不包含
  | 'equals'      // 等于
  | 'notEquals'   // 不等于
  | 'startsWith'  // 开头为
  | 'endsWith'    // 结尾为
  | 'isEmpty'     // 为空
  | 'isNotEmpty'  // 不为空
  | 'gt'          // 大于
  | 'gte'         // 大于等于
  | 'lt'          // 小于
  | 'lte'         // 小于等于
  | 'between'     // 区间
  | 'in'          // 在列表中

// 筛选条件类型
interface FilterCondition {
  field: string
  type: FieldType
  operator: FilterOperator
  value: string | number | string[] | { min?: number; max?: number; startDate?: string; endDate?: string } | null
}

// 筛选操作符选项 - 使用翻译键
const TEXT_OPERATORS_KEYS: { value: FilterOperator; labelKey: string }[] = [
  { value: 'contains', labelKey: 'filter.contains' },
  { value: 'notContains', labelKey: 'filter.notContains' },
  { value: 'equals', labelKey: 'filter.equals' },
  { value: 'notEquals', labelKey: 'filter.notEquals' },
  { value: 'startsWith', labelKey: 'filter.startsWith' },
  { value: 'endsWith', labelKey: 'filter.endsWith' },
  { value: 'isEmpty', labelKey: 'filter.isEmpty' },
  { value: 'isNotEmpty', labelKey: 'filter.isNotEmpty' },
]

const NUMBER_OPERATORS_KEYS: { value: FilterOperator; labelKey: string }[] = [
  { value: 'equals', labelKey: 'filter.equals' },
  { value: 'notEquals', labelKey: 'filter.notEquals' },
  { value: 'gt', labelKey: 'filter.gt' },
  { value: 'gte', labelKey: 'filter.gte' },
  { value: 'lt', labelKey: 'filter.lt' },
  { value: 'lte', labelKey: 'filter.lte' },
  { value: 'between', labelKey: 'filter.between' },
  { value: 'isEmpty', labelKey: 'filter.isEmpty' },
  { value: 'isNotEmpty', labelKey: 'filter.isNotEmpty' },
]

const DATE_OPERATORS_KEYS: { value: FilterOperator; labelKey: string }[] = [
  { value: 'equals', labelKey: 'filter.equals' },
  { value: 'gt', labelKey: 'filter.after' },
  { value: 'gte', labelKey: 'filter.onOrAfter' },
  { value: 'lt', labelKey: 'filter.before' },
  { value: 'lte', labelKey: 'filter.onOrBefore' },
  { value: 'between', labelKey: 'filter.between' },
  { value: 'isEmpty', labelKey: 'filter.isEmpty' },
  { value: 'isNotEmpty', labelKey: 'filter.isNotEmpty' },
]

const SELECT_OPERATORS_KEYS: { value: FilterOperator; labelKey: string }[] = [
  { value: 'equals', labelKey: 'filter.equals' },
  { value: 'notEquals', labelKey: 'filter.notEquals' },
  { value: 'isEmpty', labelKey: 'filter.isEmpty' },
  { value: 'isNotEmpty', labelKey: 'filter.isNotEmpty' },
]

// 解析选项配置，支持多种格式：
// 1. JSON 字符串数组: ["A", "B", "C"]
// 2. JSON 对象数组: [{"value":"A","label":"选项A"}]
// 3. 逗号分隔字符串: "A,B,C"
function parseOptions(optionsStr: string | null | undefined): string[] {
  if (!optionsStr) return []
  try {
    const parsed = JSON.parse(optionsStr)
    if (Array.isArray(parsed)) {
      // 检查是否是对象数组格式
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        return parsed.map((opt: any) => opt.value || opt.name || opt)
      }
      // 简单字符串数组
      return parsed.map((opt: string) => opt)
    }
  } catch {
    // 逗号分隔的字符串
    return optionsStr.split(',').map((o) => o.trim()).filter(Boolean)
  }
  return []
}

// 列筛选下拉菜单组件
interface ColumnFilterDropdownProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  columnName: string
  columnId: string
  fieldType: FieldType | null
  fieldForColumn: FieldConfig | undefined
  operators: { value: FilterOperator; labelKey: string }[]
  filterOperator: FilterOperator
  setFilterOperator: (op: FilterOperator) => void
  filterValue: string | number | { min?: number; max?: number; startDate?: string; endDate?: string }
  setFilterValue: (value: any) => void
  onApply: () => void
  onClear: () => void
  onClose: () => void
}

function ColumnFilterDropdown({
  isOpen,
  anchorRef,
  columnName,
  columnId: _columnId,
  fieldType,
  fieldForColumn,
  operators,
  filterOperator,
  setFilterOperator,
  filterValue,
  setFilterValue,
  onApply,
  onClear,
  onClose,
}: ColumnFilterDropdownProps) {
  const { t } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const dropdownHeight = 250
      const viewportHeight = window.innerHeight
      const showAbove = rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight
      setPosition({
        top: showAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
      })
    }
  }, [isOpen, anchorRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // 检查是否点击在 radix-ui portal 内（如 SelectContent）
      const isRadixPortal = target instanceof Element && (
        target.closest('[data-slot="select-content"]') ||
        target.closest('[data-radix-select-viewport]') ||
        target.closest('[role="listbox"]')
      )
      if (
        !isRadixPortal &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  const needsValueInput = filterOperator !== 'isEmpty' && filterOperator !== 'isNotEmpty'

  const dropdown = (
    <div
      ref={dropdownRef}
      className="fixed w-64 bg-popover rounded-lg shadow-xl border z-[9999] p-3"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-sm font-medium text-foreground mb-2">
        {t('assets.filter')}: {columnName}
      </div>

      <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterOperator)}>
        <SelectTrigger className="w-full mb-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op.value} value={op.value}>{t(op.labelKey)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsValueInput && (fieldType === 'TEXT' || fieldType === 'TEXTAREA') && (
        <Input
          placeholder={t('filter.enterFilterValue')}
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="mb-2"
        />
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator === 'between' && (
        <div className="flex items-center gap-2 mb-2">
          <Input
            type="number"
            placeholder={t('filter.min')}
            value={(filterValue as any)?.min || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), min: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={t('filter.max')}
            value={(filterValue as any)?.max || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), max: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1"
          />
        </div>
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator !== 'between' && (
        <Input
          type="number"
          placeholder={t('filter.enterNumber')}
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value ? Number(e.target.value) : '')}
          className="mb-2"
        />
      )}

      {needsValueInput && fieldType === 'DATE' && filterOperator === 'between' && (
        <div className="flex items-center gap-2 mb-2">
          <Input
            type="date"
            value={(filterValue as any)?.startDate || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), startDate: e.target.value || undefined })}
            className="flex-1 text-xs"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={(filterValue as any)?.endDate || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), endDate: e.target.value || undefined })}
            className="flex-1 text-xs"
          />
        </div>
      )}

      {needsValueInput && fieldType === 'DATE' && filterOperator !== 'between' && (
        <Input
          type="date"
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="mb-2"
        />
      )}

      {needsValueInput && fieldType === 'SELECT' && fieldForColumn?.options && (
        <Select value={filterValue as string} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder={t('common.all')} />
          </SelectTrigger>
          <SelectContent>
            {parseOptions(fieldForColumn.options).map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-2 pt-1 border-t">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClear}>{t('assets.clearFilters')}</Button>
        <Button size="sm" className="flex-1" onClick={onApply}>{t('filter.apply')}</Button>
      </div>
    </div>
  )

  return createPortal(dropdown, document.body)
}

export function Assets() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [assets, setAssets] = useState<Asset[]>([])
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadAsset, setUploadAsset] = useState<Asset | null>(null)
  const [dateRangeFilter, setDateRangeFilter] = useState<{ startDate?: string; endDate?: string }>({})

  // 权限检查
  const currentUser = getStoredUser()
  const canCreate = hasPermission(currentUser?.role as UserRole, 'asset:create')
  const canUpdate = hasPermission(currentUser?.role as UserRole, 'asset:update')
  const canDelete = hasPermission(currentUser?.role as UserRole, 'asset:delete')

  // 分组视图状态
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list')
  const [groupBy, setGroupBy] = useState<string>('status')
  const [groupedData, setGroupedData] = useState<GroupedAssets | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 列头筛选状态
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null)
  const [columnFilterOperator, setColumnFilterOperator] = useState<FilterOperator>('contains')
  const [columnFilterValue, setColumnFilterValue] = useState<string | number | { min?: number; max?: number; startDate?: string; endDate?: string }>('')
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // 导出数据
  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const fieldIds = fields.map((f) => f.id)
      const response = await fetch('http://localhost:3002/api/export/' + format, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: fieldIds,
          search: search || undefined,
        }),
      })

      if (!response.ok) throw new Error(t('assets.exportFailed'))

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${t('assets.exportFilename')}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportMenu(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('assets.exportFailed'))
    }
  }

  // 导出图片
  const handleExportImages = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/images/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('assets.exportFailed'))
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${t('assets.exportImagesFilename')}_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportMenu(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('assets.exportImagesFailed'))
    }
  }

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)

      const filterObj: Record<string, any> = {}
      filters.forEach((f) => {
        filterObj[f.field] = {
          operator: f.operator,
          value: f.value,
        }
      })

      if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
        filterObj.createdAt = {
          operator: 'between',
          value: {
            startDate: dateRangeFilter.startDate,
            endDate: dateRangeFilter.endDate,
          },
        }
      }

      const [assetsRes, fieldsRes]: any[] = await Promise.all([
        assetApi.getAll({
          page,
          pageSize,
          search: search || undefined,
          sortBy: sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
          status: statusFilter || undefined,
          filters: Object.keys(filterObj).length > 0 ? JSON.stringify(filterObj) : undefined,
        }),
        fieldApi.getAll(),
      ])

      if (assetsRes?.success) {
        setAssets(assetsRes.data.data)
        setTotal(assetsRes.data.total)
      }
      if (fieldsRes?.success) {
        setFields(fieldsRes.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  // 处理 URL 参数筛选
  useEffect(() => {
    const status = searchParams.get('status')
    const searchQuery = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (status) {
      setStatusFilter(status)
    }
    if (searchQuery) {
      setSearch(searchQuery)
    }
    if (startDate || endDate) {
      setDateRangeFilter({ startDate: startDate || undefined, endDate: endDate || undefined })
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [page, pageSize, sorting, search, dateRangeFilter, statusFilter])

  // 加载分组数据
  const loadGroupedData = async () => {
    try {
      setLoading(true)
      const [groupedRes, fieldsRes]: any[] = await Promise.all([
        assetApi.getGrouped(groupBy, 100),
        fieldApi.getAll(),
      ])
      if (groupedRes?.success) {
        setGroupedData(groupedRes.data)
        setTotal(groupedRes.data.total)
        setExpandedGroups(new Set(groupedRes.data.groups.map((g: any) => g.key)))
      }
      if (fieldsRes?.success) {
        setFields(fieldsRes.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  // 切换分组展开
  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedGroups(newExpanded)
  }

  // 视图切换时加载数据
  useEffect(() => {
    if (viewMode === 'group') {
      loadGroupedData()
    } else {
      loadData()
    }
  }, [viewMode, groupBy])

  // 搜索
  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  // 获取系统字段的标签（从字段配置中获取，保持一致）
  const getFieldLabel = (fieldName: string, defaultLabel: string) => {
    const field = fields.find(f => f.name === fieldName)
    return field?.label || defaultLabel
  }

  // 基础列定义 - 系统字段使用字段配置中的标签
  const baseColumns = useMemo(() => [
    columnHelper.accessor('code', {
      header: getFieldLabel('code', t('assets.assetCode')),
      cell: (info) => info.getValue() || '-',
      size: 120,
    }),
    columnHelper.accessor('name', {
      header: getFieldLabel('name', t('assets.assetName')),
      cell: (info) => (
        <button
          onClick={() => navigate(`/assets/${info.row.original.id}`)}
          className="font-medium text-primary hover:text-primary/80 text-left"
        >
          {info.getValue()}
        </button>
      ),
      size: 200,
    }),
    columnHelper.accessor('createdAt', {
      header: t('assets.createdAt'),
      cell: (info) => new Date(info.getValue()).toLocaleDateString('zh-CN'),
      size: 120,
    }),
    columnHelper.accessor('status', {
      header: getFieldLabel('status', t('assets.status')),
      cell: (info) => {
        const status = info.getValue() as AssetStatus
        const statusStyles: Record<AssetStatus, string> = {
          ACTIVE: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
          IDLE: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
          DAMAGED: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
          SCRAPPED: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
        }
        return (
          <Badge variant="secondary" className={statusStyles[status]}>
            {ASSET_STATUS_LABELS[status]}
          </Badge>
        )
      },
      size: 100,
    }),
  ], [navigate, fields, t])

  // 动态字段列 - 过滤掉系统字段（name, code, status 已在 baseColumns 中定义）
  const dynamicColumns = useMemo(() => {
    // 系统字段名称列表
    const systemFieldNames = ['name', 'code', 'status']
    // 过滤掉系统字段和不可见字段
    const customFields = fields.filter(f => !systemFieldNames.includes(f.name) && f.visible !== false)

    return customFields.map((field) =>
      columnHelper.accessor(
        (row) => {
          try {
            const data = JSON.parse(row.data || '{}')
            return data[field.name]
          } catch {
            return undefined
          }
        },
        {
          id: `field_${field.name}`,
          header: field.label,
          cell: (info) => {
            const value = info.getValue()
            if (value === undefined || value === null) return '-'
            if (field.type === 'DATE') {
              return new Date(value as string).toLocaleDateString('zh-CN')
            }
            return String(value)
          },
          size: 150,
        }
      )
    )
  }, [fields])

  // 所有列
  const columns = useMemo(() => [
    // 选择列
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label={t('common.selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('common.selectRow')}
        />
      ),
      size: 40,
    }),
    ...baseColumns,
    ...dynamicColumns,
    columnHelper.display({
      id: 'actions',
      header: t('common.actions'),
      cell: (info) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigate(`/assets/${info.row.original.id}`)}
            title={t('assets.viewDetail')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setUploadAsset(info.row.original)
                setShowImageUpload(true)
              }}
              title={t('assets.addPhoto')}
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setEditingAsset(info.row.original)
                setShowAssetForm(true)
              }}
              title={t('common.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={async () => {
                if (confirm(t('assets.confirmDelete'))) {
                  try {
                    const result: any = await assetApi.delete(info.row.original.id)
                    if (result?.success) {
                      loadData()
                    } else {
                      setError(t('common.error'))
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : t('common.error'))
                  }
                }
              }}
              title={t('common.delete')}
              className="hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
      size: 120,
    }),
  ], [baseColumns, dynamicColumns, navigate, canUpdate, canDelete])

  // 表格实例
  const table = useReactTable({
    data: assets,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    columnResizeMode: 'onChange',
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  })

  const totalPages = Math.ceil(total / pageSize)

  // 获取选中的资产 ID
  const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key])
  const selectedCount = selectedIds.length

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedCount === 0) return
    if (!confirm(t('assets.confirmBatchDelete', { count: selectedCount }))) return

    try {
      const result = await assetApi.batchDelete(selectedIds)
      if (result.success) {
        setRowSelection({})
        loadData()
      } else {
        setError(t('common.error'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
  }

  // 清除选择
  const clearSelection = () => {
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('assets.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('assets.totalCount', { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 批量操作 */}
          {selectedCount > 0 && canDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('assets.selectedCount', { count: selectedCount })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                {t('common.clearSelection')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('common.batchDelete')}
              </Button>
            </div>
          )}
          {canCreate && (
            <Button onClick={() => {
              setEditingAsset(null)
              setShowAssetForm(true)
            }}>
              <Plus className="w-4 h-4 mr-1" />
              {t('assets.addAsset')}
            </Button>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title={t('assets.instructions.title')}
        instructions={[
          t('assets.instructions.1'),
          t('assets.instructions.2'),
          t('assets.instructions.3'),
          t('assets.instructions.4'),
          t('assets.instructions.5'),
        ]}
      />

      {/* 工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 flex items-center gap-2 min-w-[200px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('assets.searchPlaceholder')}
                className="flex-1"
              />
              <Button variant="secondary" size="icon" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 border-l pl-4">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                title={t('assets.listView')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'group' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('group')}
                title={t('assets.groupView')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

            {/* 分组字段选择 */}
            {viewMode === 'group' && (
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">{t('assets.groupByStatus')}</SelectItem>
                  <SelectItem value="categoryId">{t('assets.groupByCategory')}</SelectItem>
                  <SelectItem value="createdAt">{t('assets.groupByMonth')}</SelectItem>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      {t('assets.groupByField', { field: field.label })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant={showFilterPanel || filters.length > 0 || statusFilter ? 'default' : 'outline'}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('assets.filter')}
              {(filters.length > 0 || statusFilter) && (
                <Badge variant="secondary" className="ml-1">
                  {filters.length + (statusFilter ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  {t('assets.export')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  {t('assets.exportExcel')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  {t('assets.exportCSV')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportImages}>
                  {t('assets.exportImages')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={showColumnSelector} onOpenChange={setShowColumnSelector}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {showColumnSelector ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {t('assets.columns')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {table.getAllColumns().map((column) => (
                  <label key={column.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">
                      {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                    </span>
                  </label>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 筛选面板 */}
      {showFilterPanel && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('assets.advancedFilter')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters([])
                    setPage(1)
                  }}
                >
                  {t('assets.clearFilters')}
                </Button>
                <Button size="sm" onClick={() => {
                  setShowFilterPanel(false)
                  handleSearch()
                }}>
                  {t('filter.apply')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 已添加的筛选条件 */}
            {filters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.map((filter, index) => {
                  const field = fields.find(f => f.name === filter.field)
                  const allOperators = [...TEXT_OPERATORS_KEYS, ...NUMBER_OPERATORS_KEYS, ...DATE_OPERATORS_KEYS, ...SELECT_OPERATORS_KEYS]
                  const operatorKey = allOperators.find(op => op.value === filter.operator)?.labelKey || filter.operator
                  const operatorLabel = t(operatorKey)
                  let valueDisplay = ''
                  if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
                    valueDisplay = ''
                  } else if (filter.operator === 'between') {
                    const v = filter.value as { min?: number; max?: number; startDate?: string; endDate?: string }
                    valueDisplay = `${v.min ?? v.startDate ?? ''} - ${v.max ?? v.endDate ?? ''}`
                  } else if (Array.isArray(filter.value)) {
                    valueDisplay = filter.value.join(', ')
                  } else {
                    valueDisplay = String(filter.value ?? '')
                  }
                  return (
                    <Badge key={index} variant="secondary" className="gap-1 py-1 px-2">
                      <span className="font-medium">{field?.label || filter.field}</span>
                      <span className="text-muted-foreground">{operatorLabel}</span>
                      {valueDisplay && <span>{valueDisplay}</span>}
                      <button
                        onClick={() => setFilters(filters.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* 添加筛选条件 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* 状态筛选 */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('assets.status')}</span>
                  {statusFilter && (
                    <Button variant="ghost" size="sm" className="h-auto py-0.5 px-1 text-xs" onClick={() => setStatusFilter('')}>
                      {t('assets.clearFilters')}
                    </Button>
                  )}
                </div>
                <Select value={statusFilter || 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t('common.all')}</SelectItem>
                    {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 动态字段筛选 */}
              {fields.map((field) => {
                const existingFilter = filters.find(f => f.field === field.name)
                const currentOperator = existingFilter?.operator || (field.type === 'TEXT' || field.type === 'TEXTAREA' ? 'contains' : 'equals')

                const getOperators = () => {
                  if (field.type === 'TEXT' || field.type === 'TEXTAREA') return TEXT_OPERATORS_KEYS
                  if (field.type === 'NUMBER') return NUMBER_OPERATORS_KEYS
                  if (field.type === 'DATE') return DATE_OPERATORS_KEYS
                  return SELECT_OPERATORS_KEYS
                }

                const updateFilter = (operator: FilterOperator, value: any) => {
                  const newFilters = filters.filter(f => f.field !== field.name)
                  if (operator === 'isEmpty' || operator === 'isNotEmpty') {
                    newFilters.push({ field: field.name, type: field.type as FieldType, operator, value: null })
                  } else if (value !== undefined && value !== null && value !== '') {
                    newFilters.push({ field: field.name, type: field.type as FieldType, operator, value })
                  }
                  setFilters(newFilters)
                }

                const operators = getOperators()
                const needsValue = currentOperator !== 'isEmpty' && currentOperator !== 'isNotEmpty'

                return (
                  <div key={field.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      {existingFilter && (
                        <Button variant="ghost" size="sm" className="h-auto py-0.5 px-1 text-xs" onClick={() => setFilters(filters.filter(f => f.field !== field.name))}>
                          {t('assets.clearFilters')}
                        </Button>
                      )}
                    </div>

                    <Select
                      value={currentOperator}
                      onValueChange={(v) => {
                        const newOperator = v as FilterOperator
                        const existing = filters.find(f => f.field === field.name)
                        updateFilter(newOperator, existing?.value)
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs mb-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op.value} value={op.value}>{t(op.labelKey)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {needsValue && (field.type === 'TEXT' || field.type === 'TEXTAREA') && (
                      <Input
                        placeholder={t('filter.enterField', { field: field.label })}
                        value={(existingFilter?.value as string) || ''}
                        onChange={(e) => updateFilter(currentOperator, e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}

                    {needsValue && field.type === 'NUMBER' && currentOperator === 'between' && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder={t('filter.min')}
                          value={(existingFilter?.value as any)?.min || ''}
                          onChange={(e) => {
                            const existing = existingFilter?.value as any || {}
                            updateFilter(currentOperator, { ...existing, min: e.target.value ? Number(e.target.value) : undefined })
                          }}
                          className="h-8 text-sm flex-1"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input
                          type="number"
                          placeholder={t('filter.max')}
                          value={(existingFilter?.value as any)?.max || ''}
                          onChange={(e) => {
                            const existing = existingFilter?.value as any || {}
                            updateFilter(currentOperator, { ...existing, max: e.target.value ? Number(e.target.value) : undefined })
                          }}
                          className="h-8 text-sm flex-1"
                        />
                      </div>
                    )}

                    {needsValue && field.type === 'NUMBER' && currentOperator !== 'between' && (
                      <Input
                        type="number"
                        placeholder={t('filter.enterNumber')}
                        value={existingFilter?.value as string || ''}
                        onChange={(e) => updateFilter(currentOperator, e.target.value ? Number(e.target.value) : '')}
                        className="h-8 text-sm"
                      />
                    )}

                    {needsValue && field.type === 'DATE' && currentOperator === 'between' && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={(existingFilter?.value as any)?.startDate || ''}
                          onChange={(e) => {
                            const existing = existingFilter?.value as any || {}
                            updateFilter(currentOperator, { ...existing, startDate: e.target.value || undefined })
                          }}
                          className="h-8 text-xs flex-1"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input
                          type="date"
                          value={(existingFilter?.value as any)?.endDate || ''}
                          onChange={(e) => {
                            const existing = existingFilter?.value as any || {}
                            updateFilter(currentOperator, { ...existing, endDate: e.target.value || undefined })
                          }}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    )}

                    {needsValue && field.type === 'DATE' && currentOperator !== 'between' && (
                      <Input
                        type="date"
                        value={existingFilter?.value as string || ''}
                        onChange={(e) => updateFilter(currentOperator, e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}

                    {needsValue && (field.type === 'SELECT' || field.type === 'MULTISELECT') && field.options && (
                      <Select
                        value={existingFilter?.value as string || ''}
                        onValueChange={(v) => updateFilter(currentOperator, v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder={t('common.all')} />
                        </SelectTrigger>
                        <SelectContent>
                          {parseOptions(field.options).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {!needsValue && (
                      <p className="text-xs text-muted-foreground italic">
                        {t('filter.selected', { operator: t(operators.find(op => op.value === currentOperator)?.labelKey || '') })}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* 分组视图 */}
      {viewMode === 'group' && (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <TableSkeleton rows={5} columns={4} />
              </CardContent>
            </Card>
          ) : !groupedData || groupedData.groups.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                {search ? (
                  <EmptySearch searchTerm={search} />
                ) : (
                  <EmptyAssets
                    onAction={canCreate ? () => { setEditingAsset(null); setShowAssetForm(true) } : undefined}
                    actionLabel={t('assets.addAsset')}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            groupedData.groups.map((group) => (
              <Card key={group.key}>
                {/* 分组标题 */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRightIcon
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        expandedGroups.has(group.key) && "rotate-90"
                      )}
                    />
                    <span className="font-medium text-foreground">
                      {group.label}
                    </span>
                    <Badge variant="secondary">
                      {group.count}
                    </Badge>
                  </div>
                </button>

                {/* 分组内容 */}
                {expandedGroups.has(group.key) && (
                  <div className="divide-y">
                    {group.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <button
                              onClick={() => navigate(`/assets/${asset.id}`)}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {asset.name}
                            </button>
                            <p className="text-sm text-muted-foreground">
                              {asset.code || t('assets.noCode')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-xs" onClick={() => navigate(`/assets/${asset.id}`)} title={t('assets.viewDetail')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="icon-xs" onClick={() => { setUploadAsset(asset); setShowImageUpload(true) }} title={t('assets.addPhoto')}>
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button variant="ghost" size="icon-xs" onClick={() => { setEditingAsset(asset); setShowAssetForm(true) }} title={t('common.edit')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon-xs" onClick={async () => {
                              if (confirm(t('assets.confirmDelete'))) {
                                try {
                                  const result: any = await assetApi.delete(asset.id)
                                  if (result?.success) loadGroupedData()
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : t('common.error'))
                                }
                              }
                            }} title={t('common.delete')} className="hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* 列表视图 - 表格 */}
      {viewMode === 'list' && (
        <Card>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.id
                    const isActionsColumn = columnId === 'actions'
                    const fieldForColumn = fields.find(f => `field_${f.name}` === columnId)

                    const getFieldType = (): FieldType | null => {
                      if (columnId === 'createdAt') return 'DATE'
                      if (columnId === 'name' || columnId === 'code') return 'TEXT'
                      return fieldForColumn?.type as FieldType || null
                    }
                    const fieldType = getFieldType()

                    const getColumnName = () => {
                      if (columnId === 'createdAt' || columnId === 'name' || columnId === 'code') return columnId
                      return fieldForColumn?.name || ''
                    }
                    const columnName = getColumnName()
                    const existingFilter = filters.find(f => f.field === columnName)

                    const getOperators = () => {
                      if (fieldType === 'TEXT' || fieldType === 'TEXTAREA') return TEXT_OPERATORS_KEYS
                      if (fieldType === 'NUMBER') return NUMBER_OPERATORS_KEYS
                      if (fieldType === 'DATE') return DATE_OPERATORS_KEYS
                      return SELECT_OPERATORS_KEYS
                    }

                    const openColumnFilter = (e: React.MouseEvent) => {
                      e.stopPropagation()
                      if (activeFilterColumn === columnId) {
                        setActiveFilterColumn(null)
                      } else {
                        setActiveFilterColumn(columnId)
                        setColumnFilterOperator(existingFilter?.operator || (fieldType === 'TEXT' || fieldType === 'TEXTAREA' ? 'contains' : 'equals'))
                        if (existingFilter?.value) {
                          setColumnFilterValue(existingFilter.value as any)
                        } else {
                          setColumnFilterValue('')
                        }
                      }
                    }

                    const applyColumnFilter = () => {
                      const newFilters = filters.filter(f => f.field !== columnName)
                      const needsValue = columnFilterOperator !== 'isEmpty' && columnFilterOperator !== 'isNotEmpty'

                      if (!needsValue || columnFilterValue !== '' && columnFilterValue !== null) {
                        newFilters.push({
                          field: columnName,
                          type: fieldType || 'TEXT',
                          operator: columnFilterOperator,
                          value: needsValue ? columnFilterValue : null
                        })
                      }
                      setFilters(newFilters)

                      setActiveFilterColumn(null)
                      setPage(1)

                      setTimeout(() => {
                        const filterObj: Record<string, any> = {}
                        newFilters.forEach((f) => {
                          filterObj[f.field] = {
                            operator: f.operator,
                            value: f.value,
                          }
                        })

                        assetApi.getAll({
                          page: 1,
                          pageSize,
                          search: search || undefined,
                          sortBy: sorting[0]?.id,
                          sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
                          filters: Object.keys(filterObj).length > 0 ? JSON.stringify(filterObj) : undefined,
                        }).then((res: any) => {
                          if (res?.success) {
                            setAssets(res.data.data)
                            setTotal(res.data.total)
                          }
                        })
                      }, 0)
                    }

                    const clearColumnFilter = () => {
                      const newFilters = filters.filter(f => f.field !== columnName)
                      setFilters(newFilters)
                      setActiveFilterColumn(null)
                      setColumnFilterValue('')
                      setPage(1)
                    }

                    const operators = fieldType ? getOperators() : []

                    return (
                      <TableHead
                        key={header.id}
                        className="relative select-none"
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="flex items-center gap-1 cursor-pointer hover:text-foreground flex-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )
                            )}
                          </div>
                          {!isActionsColumn && fieldType && (
                            <Button
                              ref={(el) => { filterButtonRefs.current[columnId] = el }}
                              variant="ghost"
                              size="icon-xs"
                              onClick={openColumnFilter}
                              className={cn(
                                existingFilter
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Filter className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                        <ColumnFilterDropdown
                          isOpen={activeFilterColumn === columnId}
                          anchorRef={{ current: filterButtonRefs.current[columnId] || null }}
                          columnName={typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : columnId}
                          columnId={columnId}
                          fieldType={fieldType}
                          fieldForColumn={fieldForColumn}
                          operators={operators}
                          filterOperator={columnFilterOperator}
                          setFilterOperator={setColumnFilterOperator}
                          filterValue={columnFilterValue}
                          setFilterValue={setColumnFilterValue}
                          onApply={applyColumnFilter}
                          onClear={clearColumnFilter}
                          onClose={() => setActiveFilterColumn(null)}
                        />

                        <div
                          className="absolute right-0 top-0 h-full w-1 bg-primary cursor-col-resize opacity-0 hover:opacity-100"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        />
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0 border-0">
                    {search || filters.length > 0 || statusFilter ? (
                      <EmptySearch searchTerm={search} />
                    ) : (
                      <EmptyAssets
                        onAction={canCreate ? () => { setEditingAsset(null); setShowAssetForm(true) } : undefined}
                        actionLabel={t('assets.addAsset')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('assets.perPage')}</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{t('assets.items')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('assets.pageInfo', { page, total: totalPages })}
              </span>
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 资产表单 */}
      <AssetForm
        isOpen={showAssetForm}
        onClose={() => {
          setShowAssetForm(false)
          setEditingAsset(null)
        }}
        onSuccess={viewMode === 'group' ? loadGroupedData : loadData}
        asset={editingAsset}
        fields={fields}
      />

      {/* 图片上传模态框 */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => {
          setShowImageUpload(false)
          setUploadAsset(null)
        }}
        assetId={uploadAsset?.id || ''}
        assetName={uploadAsset?.name || ''}
        onSuccess={viewMode === 'group' ? loadGroupedData : loadData}
      />
    </div>
  )
}
