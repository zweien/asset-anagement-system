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
  const [loading, setLoading] = useState(false)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            添加照片 - {assetName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <ImageUploader
            assetId={assetId}
            images={images}
            onImagesChange={() => {
              loadImages()
              onSuccess()
            }}
          />
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            完成
          </button>
        </div>
      </div>
    </div>
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

// 列筛选下拉菜单组件（使用 Portal 避免被父容器裁剪）
interface ColumnFilterDropdownProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement>
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

  // 计算下拉菜单位置
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const dropdownHeight = 250 // 预估下拉菜单高度
      const viewportHeight = window.innerHeight

      // 如果下方空间不足，显示在上方
      const showAbove = rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight

      setPosition({
        top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [isOpen, anchorRef])

  // 点击外部关闭
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
      className="fixed w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] p-3"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        筛选: {columnName}
      </div>

      {/* 操作符选择 */}
      <select
        value={filterOperator}
        onChange={(e) => setFilterOperator(e.target.value as FilterOperator)}
        className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {operators.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* 值输入 */}
      {needsValueInput && (fieldType === 'TEXT' || fieldType === 'TEXTAREA') && (
        <input
          type="text"
          placeholder="输入筛选值..."
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator === 'between' && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            placeholder="最小"
            value={(filterValue as any)?.min || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), min: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder="最大"
            value={(filterValue as any)?.max || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), max: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {needsValueInput && fieldType === 'NUMBER' && filterOperator !== 'between' && (
        <input
          type="number"
          placeholder="输入数值"
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      )}

      {needsValueInput && fieldType === 'DATE' && filterOperator === 'between' && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="date"
            value={(filterValue as any)?.startDate || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), startDate: e.target.value || undefined })}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={(filterValue as any)?.endDate || ''}
            onChange={(e) => setFilterValue({ ...(filterValue as any || {}), endDate: e.target.value || undefined })}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {needsValueInput && fieldType === 'DATE' && filterOperator !== 'between' && (
        <input
          type="date"
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      )}

      {needsValueInput && fieldType === 'SELECT' && columnId === 'status' && (
        <select
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">请选择</option>
          {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}

      {needsValueInput && fieldType === 'SELECT' && fieldForColumn?.options && (
        <select
          value={filterValue as string}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">请选择</option>
          {fieldForColumn.options.split(',').map((opt) => (
            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
          ))}
        </select>
      )}

      {/* 按钮组 */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onClear}
          className="flex-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded"
        >
          清除
        </button>
        <button
          onClick={onApply}
          className="flex-1 px-2 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded"
        >
          应用
        </button>
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
  // 列头筛选按钮引用
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

      // 构建筛选条件（新格式：包含 operator 和 value）
      const filterObj: Record<string, any> = {}
      filters.forEach((f) => {
        filterObj[f.field] = {
          operator: f.operator,
          value: f.value,
        }
      })

      // 添加日期范围筛选
      if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
        filterObj.createdAt = {
          operator: 'between',
          value: {
            startDate: dateRangeFilter.startDate,
            endDate: dateRangeFilter.endDate,
          },
        }
      }

      const [assetsRes, fieldsRes] = await Promise.all([
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

      if (assetsRes.success) {
        setAssets(assetsRes.data.data)
        setTotal(assetsRes.data.total)
      }
      if (fieldsRes.success) {
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
      const [groupedRes, fieldsRes] = await Promise.all([
        assetApi.getGrouped(groupBy, 100),
        fieldApi.getAll(),
      ])
      if (groupedRes.success) {
        setGroupedData(groupedRes.data)
        setTotal(groupedRes.data.total)
        // 默认展开所有分组
        setExpandedGroups(new Set(groupedRes.data.groups.map(g => g.key)))
      }
      if (fieldsRes.success) {
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
          className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-left"
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
        const colors: Record<AssetStatus, string> = {
          ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          IDLE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          SCRAPPED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
            {ASSET_STATUS_LABELS[status]}
          </span>
        )
      },
      size: 100,
    }),
    columnHelper.accessor('createdAt', {
      header: '创建时间',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('zh-CN'),
      size: 120,
    }),
  ], [])

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
          <button
            onClick={() => navigate(`/assets/${info.row.original.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            title="查看详情"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setUploadAsset(info.row.original)
              setShowImageUpload(true)
            }}
            className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            title="添加照片"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingAsset(info.row.original)
              setShowAssetForm(true)
            }}
            className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              if (confirm('确定要删除这个资产吗？')) {
                try {
                  const result = await assetApi.delete(info.row.original.id)
                  if (result.success) {
                    loadData()
                  } else {
                    setError('删除失败')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : '删除失败')
                }
              }
            }}
            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      size: 120,
    }),
  ], [baseColumns, dynamicColumns])

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">资产管理</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            共 {total} 条资产
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAsset(null)
            setShowAssetForm(true)
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          新增资产
        </button>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索资产名称或编号..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-4">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('group')}
            className={`p-2 rounded-lg ${viewMode === 'group' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            title="分组视图"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* 分组字段选择 */}
        {viewMode === 'group' && (
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="status">按状态分组</option>
            <option value="categoryId">按分类分组</option>
            <option value="createdAt">按创建月份分组</option>
            {fields.map((field) => (
              <option key={field.id} value={field.name}>
                按{field.label}分组
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`px-4 py-2 flex items-center gap-1 rounded-lg transition-colors ${
            showFilterPanel || filters.length > 0 || statusFilter
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          筛选
          {(filters.length > 0 || statusFilter) && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {filters.length + (statusFilter ? 1 : 0)}
            </span>
          )}
        </button>
        <button
          onClick={loadData}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
              >
                导出为 Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                导出为 CSV
              </button>
              <button
                onClick={handleExportImages}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
              >
                导出图片 ZIP
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
          >
            {showColumnSelector ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            列设置
          </button>
          {showColumnSelector && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-2">
              {table.getAllColumns().map((column) => (
                <label key={column.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilterPanel && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">高级筛选</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilters([])
                  setStatusFilter('')
                  setPage(1)
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                清除全部
              </button>
              <button
                onClick={() => {
                  setShowFilterPanel(false)
                  handleSearch()
                }}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              >
                应用筛选
              </button>
            </div>
          </div>

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
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    <span className="font-medium">{field?.label || filter.field}</span>
                    <span className="text-blue-600 dark:text-blue-400">{operatorLabel}</span>
                    {valueDisplay && <span>{valueDisplay}</span>}
                    <button
                      onClick={() => {
                        setFilters(filters.filter((_, i) => i !== index))
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* 添加筛选条件 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 状态筛选 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">状态</span>
                {statusFilter && (
                  <button onClick={() => setStatusFilter('')} className="text-xs text-gray-500 hover:text-red-500">
                    清除
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">全部</option>
                {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
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
                <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{field.label}</span>
                    {existingFilter && (
                      <button
                        onClick={() => setFilters(filters.filter(f => f.field !== field.name))}
                        className="text-xs text-gray-500 hover:text-red-500"
                      >
                        清除
                      </button>
                    )}
                  </div>

                  {/* 操作符选择 */}
                  <select
                    value={currentOperator}
                    onChange={(e) => {
                      const newOperator = e.target.value as FilterOperator
                      const existing = filters.find(f => f.field === field.name)
                      updateFilter(newOperator, existing?.value)
                    }}
                    className="w-full px-2 py-1 mb-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>

                  {/* 值输入 */}
                  {needsValue && (field.type === 'TEXT' || field.type === 'TEXTAREA') && (
                    <input
                      type="text"
                      placeholder={`输入${field.label}...`}
                      value={(existingFilter?.value as string) || ''}
                      onChange={(e) => updateFilter(currentOperator, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  )}

                  {needsValue && field.type === 'NUMBER' && currentOperator === 'between' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="最小"
                        value={(existingFilter?.value as any)?.min || ''}
                        onChange={(e) => {
                          const existing = existingFilter?.value as any || {}
                          updateFilter(currentOperator, { ...existing, min: e.target.value ? Number(e.target.value) : undefined })
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500 text-xs">-</span>
                      <input
                        type="number"
                        placeholder="最大"
                        value={(existingFilter?.value as any)?.max || ''}
                        onChange={(e) => {
                          const existing = existingFilter?.value as any || {}
                          updateFilter(currentOperator, { ...existing, max: e.target.value ? Number(e.target.value) : undefined })
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  {needsValue && field.type === 'NUMBER' && currentOperator !== 'between' && (
                    <input
                      type="number"
                      placeholder="输入数值"
                      value={existingFilter?.value as string || ''}
                      onChange={(e) => updateFilter(currentOperator, e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  )}

                  {needsValue && field.type === 'DATE' && currentOperator === 'between' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={(existingFilter?.value as any)?.startDate || ''}
                        onChange={(e) => {
                          const existing = existingFilter?.value as any || {}
                          updateFilter(currentOperator, { ...existing, startDate: e.target.value || undefined })
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500 text-xs">-</span>
                      <input
                        type="date"
                        value={(existingFilter?.value as any)?.endDate || ''}
                        onChange={(e) => {
                          const existing = existingFilter?.value as any || {}
                          updateFilter(currentOperator, { ...existing, endDate: e.target.value || undefined })
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  {needsValue && field.type === 'DATE' && currentOperator !== 'between' && (
                    <input
                      type="date"
                      value={existingFilter?.value as string || ''}
                      onChange={(e) => updateFilter(currentOperator, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  )}

                  {needsValue && (field.type === 'SELECT' || field.type === 'MULTISELECT') && field.options && (
                    <select
                      value={existingFilter?.value as string || ''}
                      onChange={(e) => updateFilter(currentOperator, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">请选择</option>
                      {field.options.split(',').map((opt) => (
                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  )}

                  {!needsValue && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      已选择 "{operators.find(op => op.value === currentOperator)?.label}"
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}

      {/* 分组视图 */}
      {viewMode === 'group' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500">
              加载中...
            </div>
          ) : !groupedData || groupedData.groups.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500">
              暂无资产数据
            </div>
          ) : (
            groupedData.groups.map((group) => (
              <div
                key={group.key}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                {/* 分组标题 */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRightIcon
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedGroups.has(group.key) ? 'rotate-90' : ''
                      }`}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {groupBy === 'status'
                        ? ASSET_STATUS_LABELS[group.key as AssetStatus] || group.label
                        : group.label}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 rounded-full">
                      {group.count}
                    </span>
                  </div>
                </button>

                {/* 分组内容 */}
                {expandedGroups.has(group.key) && (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <button
                              onClick={() => navigate(`/assets/${asset.id}`)}
                              className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {asset.name}
                            </button>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {asset.code || '无编号'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              asset.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : asset.status === 'IDLE'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : asset.status === 'MAINTENANCE'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {ASSET_STATUS_LABELS[asset.status as AssetStatus]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            title="查看详情"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUploadAsset(asset)
                              setShowImageUpload(true)
                            }}
                            className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                            title="添加照片"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingAsset(asset)
                              setShowAssetForm(true)
                            }}
                            className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('确定要删除这个资产吗？')) {
                                try {
                                  const result = await assetApi.delete(asset.id)
                                  if (result.success) {
                                    loadGroupedData()
                                  }
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : '删除失败')
                                }
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 列表视图 - 表格 */}
      {viewMode === 'list' && (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ width: table.getTotalSize() }}>
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    // 获取列对应的字段信息
                    const columnId = header.column.id
                    const isActionsColumn = columnId === 'actions'
                    const fieldForColumn = fields.find(f => `field_${f.name}` === columnId)

                    // 获取字段类型
                    const getFieldType = (): FieldType | null => {
                      if (columnId === 'status') return 'SELECT'
                      if (columnId === 'createdAt') return 'DATE'
                      if (columnId === 'name' || columnId === 'code' || columnId === 'category') return 'TEXT'
                      return fieldForColumn?.type as FieldType || null
                    }
                    const fieldType = getFieldType()

                    // 获取当前列的筛选条件
                    const getColumnName = () => {
                      if (columnId === 'status' || columnId === 'createdAt' || columnId === 'name' || columnId === 'code') return columnId
                      return fieldForColumn?.name || ''
                    }
                    const columnName = getColumnName()
                    const existingFilter = filters.find(f => f.field === columnName)

                    // 获取操作符列表
                    const getOperators = () => {
                      if (fieldType === 'TEXT' || fieldType === 'TEXTAREA') return TEXT_OPERATORS
                      if (fieldType === 'NUMBER') return NUMBER_OPERATORS
                      if (fieldType === 'DATE') return DATE_OPERATORS
                      return SELECT_OPERATORS
                    }

                    // 打开列筛选菜单
                    const openColumnFilter = (e: React.MouseEvent) => {
                      e.stopPropagation()
                      if (activeFilterColumn === columnId) {
                        setActiveFilterColumn(null)
                      } else {
                        setActiveFilterColumn(columnId)
                        setColumnFilterOperator(existingFilter?.operator || (fieldType === 'TEXT' || fieldType === 'TEXTAREA' ? 'contains' : 'equals'))
                        // 对于状态列，从 statusFilter 获取当前值
                        if (columnId === 'status' && statusFilter) {
                          setColumnFilterValue(statusFilter)
                        } else if (existingFilter?.value) {
                          setColumnFilterValue(existingFilter.value as any)
                        } else {
                          setColumnFilterValue('')
                        }
                      }
                    }

                    // 应用列筛选
                    const applyColumnFilter = () => {
                      const newFilters = filters.filter(f => f.field !== columnName)
                      const needsValue = columnFilterOperator !== 'isEmpty' && columnFilterOperator !== 'isNotEmpty'

                      // 状态列特殊处理
                      if (columnId === 'status') {
                        const newStatus = needsValue && columnFilterValue ? String(columnFilterValue) : ''
                        setStatusFilter(newStatus)
                      } else {
                        // 其他列添加到 filters 数组
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

                      // 自动应用筛选
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
                        }).then(res => {
                          if (res.success) {
                            setAssets(res.data.data)
                            setTotal(res.data.total)
                          }
                        })
                      }, 0)
                    }

                    // 清除列筛选
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
                    const needsValueInput = columnFilterOperator !== 'isEmpty' && columnFilterOperator !== 'isNotEmpty'

                    return (
                    <th
                      key={header.id}
                      className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none"
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 flex-1"
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
                        {/* 筛选图标 */}
                        {!isActionsColumn && fieldType && (
                          <button
                            ref={(el) => { filterButtonRefs.current[columnId] = el }}
                            onClick={openColumnFilter}
                            className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                              existingFilter || (columnId === 'status' && statusFilter)
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="筛选"
                          >
                            <Filter className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 列筛选下拉菜单 - 使用 Portal 渲染 */}
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

                      {/* 列宽调整手柄 */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 bg-primary-500 cursor-col-resize opacity-0 hover:opacity-100"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                    暂无资产数据
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>每页</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>条</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
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
