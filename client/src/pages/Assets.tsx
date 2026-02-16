import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Plus, Search, RefreshCw, Filter, X, Edit2, Trash2, Download, LayoutGrid, List, ChevronRight as ChevronRightIcon, Camera, ExternalLink } from 'lucide-react'
import { assetApi, fieldApi, ASSET_STATUS_LABELS } from '../lib/api'
import type { Asset, FieldConfig, AssetStatus, FieldType, GroupedAssets } from '../lib/api'
import { AssetForm } from '../components/AssetForm'
import { ImageUploader } from '../components/ImageUploader'
import { PageInstructions } from '@/components/PageInstructions'
import { Button } from '@/components/ui/button'
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
          <DialogTitle>添加照片 - {assetName}</DialogTitle>
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
          <Button variant="outline" onClick={onClose}>完成</Button>
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

// 筛选操作符选项
const TEXT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: '包含' },
  { value: 'notContains', label: '不包含' },
  { value: 'equals', label: '等于' },
  { value: 'notEquals', label: '不等于' },
  { value: 'startsWith', label: '开头为' },
  { value: 'endsWith', label: '结尾为' },
  { value: 'isEmpty', label: '为空' },
  { value: 'isNotEmpty', label: '不为空' },
]

const NUMBER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: '等于' },
  { value: 'notEquals', label: '不等于' },
  { value: 'gt', label: '大于' },
  { value: 'gte', label: '大于等于' },
  { value: 'lt', label: '小于' },
  { value: 'lte', label: '小于等于' },
  { value: 'between', label: '区间' },
  { value: 'isEmpty', label: '为空' },
  { value: 'isNotEmpty', label: '不为空' },
]

const DATE_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: '等于' },
  { value: 'gt', label: '之后' },
  { value: 'gte', label: '不早于' },
  { value: 'lt', label: '之前' },
  { value: 'lte', label: '不晚于' },
  { value: 'between', label: '区间' },
  { value: 'isEmpty', label: '为空' },
  { value: 'isNotEmpty', label: '不为空' },
]

const SELECT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: '等于' },
  { value: 'notEquals', label: '不等于' },
  { value: 'isEmpty', label: '为空' },
  { value: 'isNotEmpty', label: '不为空' },
]

// 列筛选下拉菜单组件
interface ColumnFilterDropdownProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  columnName: string
  columnId: string
  fieldType: FieldType | null
  fieldForColumn: FieldConfig | undefined
  operators: { value: FilterOperator; label: string }[]
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
  columnId,
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const dropdownHeight = 250
      const viewportHeight = window.innerHeight
      const showAbove = rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight
      setPosition({
        top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [isOpen, anchorRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
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
        筛选: {columnName}
      </div>

      <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterOperator)}>
        <SelectTrigger className="w-full mb-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsValueInput && (fieldType === 'TEXT' || fieldType === 'TEXTAREA') && (
        <Input
          placeholder="输入筛选值..."
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="mb-2"
        />
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator === 'between' && (
        <div className="flex items-center gap-2 mb-2">
          <Input
            type="number"
            placeholder="最小"
            value={(filterValue as any)?.min || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), min: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="最大"
            value={(filterValue as any)?.max || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), max: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1"
          />
        </div>
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator !== 'between' && (
        <Input
          type="number"
          placeholder="输入数值"
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

      {needsValueInput && fieldType === 'SELECT' && columnId === 'status' && (
        <Select value={filterValue as string} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {needsValueInput && fieldType === 'SELECT' && fieldForColumn?.options && (
        <Select value={filterValue as string} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            {fieldForColumn.options.split(',').map((opt) => (
              <SelectItem key={opt.trim()} value={opt.trim()}>{opt.trim()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-2 pt-1 border-t">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClear}>清除</Button>
        <Button size="sm" className="flex-1" onClick={onApply}>应用</Button>
      </div>
    </div>
  )

  return createPortal(dropdown, document.body)
}

export function Assets() {
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
          status: statusFilter || undefined,
          search: search || undefined,
        }),
      })

      if (!response.ok) throw new Error('导出失败')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `资产数据.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportMenu(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    }
  }

  // 导出图片
  const handleExportImages = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/images/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusFilter || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '导出失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `资产图片_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportMenu(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出图片失败')
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
      setError(err instanceof Error ? err.message : '加载失败')
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
  }, [page, pageSize, sorting, statusFilter, search, dateRangeFilter])

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
      setError(err instanceof Error ? err.message : '加载失败')
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

  // 基础列定义
  const baseColumns = useMemo(() => [
    columnHelper.accessor('code', {
      header: '资产编号',
      cell: (info) => info.getValue() || '-',
      size: 120,
    }),
    columnHelper.accessor('name', {
      header: '资产名称',
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
    columnHelper.accessor('category', {
      header: '分类',
      cell: (info) => info.getValue()?.name || '-',
      size: 120,
    }),
    columnHelper.accessor('status', {
      header: '状态',
      cell: (info) => {
        const status = info.getValue() as AssetStatus
        const statusStyles: Record<AssetStatus, string> = {
          ACTIVE: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
          IDLE: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
          MAINTENANCE: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
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
    columnHelper.accessor('createdAt', {
      header: '创建时间',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('zh-CN'),
      size: 120,
    }),
  ], [navigate])

  // 动态字段列
  const dynamicColumns = useMemo(() => {
    return fields.map((field) =>
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
    ...baseColumns,
    ...dynamicColumns,
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: (info) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigate(`/assets/${info.row.original.id}`)}
            title="查看详情"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setUploadAsset(info.row.original)
              setShowImageUpload(true)
            }}
            title="添加照片"
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setEditingAsset(info.row.original)
              setShowAssetForm(true)
            }}
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={async () => {
              if (confirm('确定要删除这个资产吗？')) {
                try {
                  const result: any = await assetApi.delete(info.row.original.id)
                  if (result?.success) {
                    loadData()
                  } else {
                    setError('删除失败')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : '删除失败')
                }
              }
            }}
            title="删除"
            className="hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 120,
    }),
  ], [baseColumns, dynamicColumns, navigate])

  // 表格实例
  const table = useReactTable({
    data: assets,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">资产管理</h1>
          <p className="mt-1 text-muted-foreground">
            共 {total} 条资产
          </p>
        </div>
        <Button onClick={() => {
          setEditingAsset(null)
          setShowAssetForm(true)
        }}>
          <Plus className="w-4 h-4 mr-1" />
          新增资产
        </Button>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title="资产管理说明"
        instructions={[
          '点击"新增资产"按钮可以添加新的资产记录',
          '支持列表视图和分组视图两种显示方式',
          '使用搜索框可以快速查找资产',
          '点击表头可以排序，使用列设置可以显示/隐藏列',
          '操作列提供查看详情、编辑、添加照片和删除功能'
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
                placeholder="搜索资产名称或编号..."
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
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'group' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('group')}
                title="分组视图"
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
                  <SelectItem value="status">按状态分组</SelectItem>
                  <SelectItem value="categoryId">按分类分组</SelectItem>
                  <SelectItem value="createdAt">按创建月份分组</SelectItem>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      按{field.label}分组
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
              筛选
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
                  导出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  导出为 Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  导出为 CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportImages}>
                  导出图片 ZIP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={showColumnSelector} onOpenChange={setShowColumnSelector}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {showColumnSelector ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  列设置
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
              <CardTitle className="text-base">高级筛选</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters([])
                    setStatusFilter('')
                    setPage(1)
                  }}
                >
                  清除全部
                </Button>
                <Button size="sm" onClick={() => {
                  setShowFilterPanel(false)
                  handleSearch()
                }}>
                  应用筛选
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
                  const operatorLabel = [...TEXT_OPERATORS, ...NUMBER_OPERATORS, ...DATE_OPERATORS, ...SELECT_OPERATORS]
                    .find(op => op.value === filter.operator)?.label || filter.operator
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
                  <span className="text-sm font-medium">状态</span>
                  {statusFilter && (
                    <Button variant="ghost" size="sm" className="h-auto py-0.5 px-1 text-xs" onClick={() => setStatusFilter('')}>
                      清除
                    </Button>
                  )}
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
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
                  if (field.type === 'TEXT' || field.type === 'TEXTAREA') return TEXT_OPERATORS
                  if (field.type === 'NUMBER') return NUMBER_OPERATORS
                  if (field.type === 'DATE') return DATE_OPERATORS
                  return SELECT_OPERATORS
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
                          清除
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
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {needsValue && (field.type === 'TEXT' || field.type === 'TEXTAREA') && (
                      <Input
                        placeholder={`输入${field.label}...`}
                        value={(existingFilter?.value as string) || ''}
                        onChange={(e) => updateFilter(currentOperator, e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}

                    {needsValue && field.type === 'NUMBER' && currentOperator === 'between' && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="最小"
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
                          placeholder="最大"
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
                        placeholder="输入数值"
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
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.split(',').map((opt) => (
                            <SelectItem key={opt.trim()} value={opt.trim()}>{opt.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {!needsValue && (
                      <p className="text-xs text-muted-foreground italic">
                        已选择 "{operators.find(op => op.value === currentOperator)?.label}"
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
              <CardContent className="p-8 text-center text-muted-foreground">
                加载中...
              </CardContent>
            </Card>
          ) : !groupedData || groupedData.groups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                暂无资产数据
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
                      {groupBy === 'status'
                        ? ASSET_STATUS_LABELS[group.key as AssetStatus] || group.label
                        : group.label}
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
                              {asset.code || '无编号'}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              asset.status === 'ACTIVE' && "bg-green-500/10 text-green-600",
                              asset.status === 'IDLE' && "bg-yellow-500/10 text-yellow-600",
                              asset.status === 'MAINTENANCE' && "bg-blue-500/10 text-blue-600",
                              asset.status === 'SCRAPPED' && "bg-gray-500/10 text-gray-600"
                            )}
                          >
                            {ASSET_STATUS_LABELS[asset.status as AssetStatus]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-xs" onClick={() => navigate(`/assets/${asset.id}`)} title="查看详情">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => { setUploadAsset(asset); setShowImageUpload(true) }} title="添加照片">
                            <Camera className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => { setEditingAsset(asset); setShowAssetForm(true) }} title="编辑">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={async () => {
                            if (confirm('确定要删除这个资产吗？')) {
                              try {
                                const result: any = await assetApi.delete(asset.id)
                                if (result?.success) loadGroupedData()
                              } catch (err) {
                                setError(err instanceof Error ? err.message : '删除失败')
                              }
                            }
                          }} title="删除" className="hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                      if (columnId === 'status') return 'SELECT'
                      if (columnId === 'createdAt') return 'DATE'
                      if (columnId === 'name' || columnId === 'code' || columnId === 'category') return 'TEXT'
                      return fieldForColumn?.type as FieldType || null
                    }
                    const fieldType = getFieldType()

                    const getColumnName = () => {
                      if (columnId === 'status' || columnId === 'createdAt' || columnId === 'name' || columnId === 'code') return columnId
                      return fieldForColumn?.name || ''
                    }
                    const columnName = getColumnName()
                    const existingFilter = filters.find(f => f.field === columnName)

                    const getOperators = () => {
                      if (fieldType === 'TEXT' || fieldType === 'TEXTAREA') return TEXT_OPERATORS
                      if (fieldType === 'NUMBER') return NUMBER_OPERATORS
                      if (fieldType === 'DATE') return DATE_OPERATORS
                      return SELECT_OPERATORS
                    }

                    const openColumnFilter = (e: React.MouseEvent) => {
                      e.stopPropagation()
                      if (activeFilterColumn === columnId) {
                        setActiveFilterColumn(null)
                      } else {
                        setActiveFilterColumn(columnId)
                        setColumnFilterOperator(existingFilter?.operator || (fieldType === 'TEXT' || fieldType === 'TEXTAREA' ? 'contains' : 'equals'))
                        if (columnId === 'status' && statusFilter) {
                          setColumnFilterValue(statusFilter)
                        } else if (existingFilter?.value) {
                          setColumnFilterValue(existingFilter.value as any)
                        } else {
                          setColumnFilterValue('')
                        }
                      }
                    }

                    const applyColumnFilter = () => {
                      const newFilters = filters.filter(f => f.field !== columnName)
                      const needsValue = columnFilterOperator !== 'isEmpty' && columnFilterOperator !== 'isNotEmpty'

                      if (columnId === 'status') {
                        const newStatus = needsValue && columnFilterValue ? String(columnFilterValue) : ''
                        setStatusFilter(newStatus)
                      } else {
                        if (!needsValue || columnFilterValue !== '' && columnFilterValue !== null) {
                          newFilters.push({
                            field: columnName,
                            type: fieldType || 'TEXT',
                            operator: columnFilterOperator,
                            value: needsValue ? columnFilterValue : null
                          })
                        }
                        setFilters(newFilters)
                      }

                      setActiveFilterColumn(null)
                      setPage(1)

                      setTimeout(() => {
                        const filterObj: Record<string, any> = {}
                        const filtersToUse = columnId === 'status' ? filters : newFilters
                        filtersToUse.forEach((f) => {
                          filterObj[f.field] = {
                            operator: f.operator,
                            value: f.value,
                          }
                        })

                        const currentStatusFilter = columnId === 'status'
                          ? (needsValue && columnFilterValue ? String(columnFilterValue) : '')
                          : statusFilter

                        assetApi.getAll({
                          page: 1,
                          pageSize,
                          search: search || undefined,
                          sortBy: sorting[0]?.id,
                          sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
                          status: currentStatusFilter || undefined,
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
                      if (columnId === 'status') {
                        setStatusFilter('')
                      } else {
                        const newFilters = filters.filter(f => f.field !== columnName)
                        setFilters(newFilters)
                      }
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
                                existingFilter || (columnId === 'status' && statusFilter)
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
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    暂无资产数据
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
              <span>每页</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>条</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
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
