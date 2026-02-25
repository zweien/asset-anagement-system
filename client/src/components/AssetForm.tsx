import { useState, useEffect, useCallback } from 'react'
import { Modal } from './ui/Modal'
import { assetApi, ASSET_STATUS_LABELS, getToken } from '../lib/api'
import { API_BASE_URL } from '../lib/config'
import type { Asset, FieldConfig, CreateAssetDto, UpdateAssetDto, AssetStatus } from '../lib/api'
import { ImageUploader } from './ImageUploader'
import { showSuccess, showError } from '../lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useKeyboard } from '@/hooks/useKeyboard'

const API_BASE = API_BASE_URL

interface ImageInfo {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt: string
}

interface AssetFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  asset?: Asset | null // 编辑模式时传入
  fields: FieldConfig[]
}

// 选项类型
interface OptionItem {
  value: string
  label: string
}

interface FormData {
  name: string
  code: string
  status: AssetStatus
  data: Record<string, unknown>
}

export function AssetForm({ isOpen, onClose, onSuccess, asset, fields }: AssetFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    status: 'IDLE' as AssetStatus,
    data: {},
  })
  const [images, setImages] = useState<ImageInfo[]>([])

  const isEditMode = !!asset

  // 系统字段名称列表
  const systemFieldNames = ['name', 'code', 'status']

  // 获取系统字段的配置（从字段配置中获取标签和必填状态）
  const getSystemFieldConfig = (fieldName: string) => {
    return fields.find(f => f.name === fieldName)
  }

  // 过滤出可见的自定义字段（排除系统字段，因为系统字段单独渲染）
  const visibleFields = fields.filter(f =>
    f.visible !== false && !systemFieldNames.includes(f.name)
  )

  // 使用 useCallback 包裹 handleSubmit，以便在 useKeyboard 中引用
  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      setError('资产名称不能为空')
      return
    }

    // 验证必填字段
    for (const field of visibleFields) {
      if (field.required) {
        const value = formData.data[field.name]
        if (value === undefined || value === null || value === '') {
          setError(`${field.label} 是必填字段`)
          return
        }
      }
    }

    setLoading(true)
    setError('')

    try {
      let result
      if (isEditMode && asset) {
        const payload: UpdateAssetDto = {
          name: formData.name,
          code: formData.code || undefined,
          status: formData.status,
          data: formData.data,
        }
        result = await assetApi.update(asset.id, payload)
      } else {
        const payload: CreateAssetDto = {
          name: formData.name,
          code: formData.code || undefined,
          status: formData.status,
          data: formData.data,
        }
        result = await assetApi.create(payload)
      }

      if (result.success) {
        showSuccess(isEditMode ? '资产更新成功' : '资产创建成功')
        onSuccess()
        onClose()
      } else {
        const errorMsg = (result as { error?: string }).error || '保存失败'
        setError(errorMsg)
        showError('保存失败', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '保存失败'
      setError(errorMsg)
      showError('保存失败', errorMsg)
    } finally {
      setLoading(false)
    }
  }, [formData, visibleFields, isEditMode, asset, onSuccess, onClose])

  // 注册 Alt+S 保存快捷键
  useKeyboard([
    { key: 's', alt: true, handler: () => { if (isOpen) handleSubmit() } },
  ])

  // 加载图片
  const loadImages = async () => {
    if (!asset) return
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/assets/${asset.id}/images`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const result = await response.json()
      if (result.success) {
        setImages(result.data)
      }
    } catch (err) {
      console.error('加载图片失败:', err)
    }
  }

  // 初始化表单数据
  useEffect(() => {
    if (asset) {
      let data = {}
      try {
        data = JSON.parse(asset.data || '{}')
      } catch {
        data = {}
      }
      setFormData({
        name: asset.name,
        code: asset.code || '',
        status: (asset.status || 'IDLE') as AssetStatus,
        data,
      })
      // 加载图片
      if (isOpen) {
        loadImages()
      }
    } else {
      setFormData({
        name: '',
        code: '',
        status: 'IDLE' as AssetStatus,
        data: {},
      })
      setImages([])
    }
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, isOpen])

  const updateDataField = (fieldName: string, value: string | number | string[] | null) => {
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value },
    }))
  }

  // 解析选项配置，支持两种格式：
  // 1. 简单字符串数组: ["在用", "闲置"]
  // 2. 对象数组: [{"value":"ACTIVE","label":"在用"}]
  const parseOptions = (optionsStr: string | null): OptionItem[] => {
    if (!optionsStr) return []
    try {
      const parsed = JSON.parse(optionsStr)
      if (Array.isArray(parsed)) {
        // 检查是否是对象数组格式
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          return parsed.map((opt: Record<string, unknown>) => ({
            value: String(opt.value || opt.name || opt),
            label: String(opt.label || opt.name || opt.value || opt),
          }))
        }
        // 简单字符串数组
        return parsed.map((opt: string) => ({ value: opt, label: opt }))
      }
    } catch {
      // 逗号分隔的字符串
      return optionsStr.split(',').map((o) => ({ value: o.trim(), label: o.trim() }))
    }
    return []
  }

  // 渲染系统字段输入（根据字段配置的类型和选项）
  const renderSystemFieldInput = (fieldName: string, value: string, onChange: (v: string) => void) => {
    const field = getSystemFieldConfig(fieldName)
    if (!field) {
      // 默认使用文本输入
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    }

    switch (field.type) {
      case 'SELECT': {
        const options = parseOptions(field.options)
        // 获取当前选中项的标签用于显示
        const selectedOption = options.find(opt => opt.value === value)
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="请选择">
                {selectedOption?.label || value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      case 'TEXTAREA':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        )
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      case 'DATE':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
    }
  }

  const renderFieldInput = (field: FieldConfig) => {
    const value = formData.data[field.name] as string | number | string[] | null | undefined
    const strValue = value ?? ''

    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            type="text"
            value={strValue}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
          />
        )
      case 'TEXTAREA':
        return (
          <Textarea
            value={strValue}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
            rows={3}
          />
        )
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={strValue}
            onChange={(e) => updateDataField(field.name, e.target.value ? Number(e.target.value) : null)}
            placeholder={`请输入${field.label}`}
          />
        )
      case 'DATE':
        return (
          <Input
            type="date"
            value={strValue}
            onChange={(e) => updateDataField(field.name, e.target.value || null)}
          />
        )
      case 'SELECT': {
        const selectOptions = parseOptions(field.options)
        const selectValue = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
        const selectedSelectOption = selectOptions.find(opt => opt.value === selectValue)
        return (
          <Select
            value={selectValue}
            onValueChange={(v) => updateDataField(field.name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择">
                {selectedSelectOption?.label || selectValue}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      case 'MULTISELECT': {
        const multiOptions = parseOptions(field.options)
        const selectedValues: string[] = Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : typeof value === 'string' && value ? [value] : []
        return (
          <div className="flex flex-wrap gap-2">
            {multiOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value)
              return (
                <Button
                  key={opt.value}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== opt.value)
                      : [...selectedValues, opt.value]
                    updateDataField(field.name, newValues)
                  }}
                >
                  {opt.label}
                </Button>
              )
            })}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '编辑资产' : '新增资产'}
      size="lg"
    >
      <div className="space-y-4">
        {/* 错误提示 */}
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {/* 基础字段 - 使用字段配置中的标签、类型和选项 */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {getSystemFieldConfig('name')?.label || '资产名称'}
            {getSystemFieldConfig('name')?.required && <span className="text-destructive"> *</span>}
          </Label>
          {renderSystemFieldInput('name', formData.name, (v) => setFormData((prev) => ({ ...prev, name: v })))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">
            {getSystemFieldConfig('code')?.label || '资产编号'}
            {getSystemFieldConfig('code')?.required && <span className="text-destructive"> *</span>}
          </Label>
          {renderSystemFieldInput('code', formData.code, (v) => setFormData((prev) => ({ ...prev, code: v })))}
        </div>

        {/* 状态字段 */}
        <div className="space-y-2">
          <Label htmlFor="status">
            {getSystemFieldConfig('status')?.label || '状态'}
            {getSystemFieldConfig('status')?.required && <span className="text-destructive"> *</span>}
          </Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as AssetStatus }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择状态" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 动态字段 - 只显示可见字段 */}
        {visibleFields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <div key={field.id} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
              {renderFieldInput(field)}
            </div>
          ))}

        {/* 图片上传 (仅编辑模式) */}
        {isEditMode && asset && (
          <div className="space-y-2">
            <Label>资产图片</Label>
            <ImageUploader
              assetId={asset.id}
              images={images}
              onImagesChange={loadImages}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : isEditMode ? '保存修改' : '创建资产'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
