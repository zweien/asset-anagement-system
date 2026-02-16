import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { assetApi, ASSET_STATUS_LABELS } from '../lib/api'
import type { Asset, FieldConfig, AssetStatus, CreateAssetDto, UpdateAssetDto } from '../lib/api'
import { ImageUploader } from './ImageUploader'
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

const API_BASE = 'http://localhost:3002/api'

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

interface FormData {
  name: string
  code: string
  categoryId: string
  status: AssetStatus
  data: Record<string, any>
}

export function AssetForm({ isOpen, onClose, onSuccess, asset, fields }: AssetFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    categoryId: '',
    status: 'IDLE',
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

  // 加载图片
  const loadImages = async () => {
    if (!asset) return
    try {
      const response = await fetch(`${API_BASE}/assets/${asset.id}/images`)
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
        categoryId: asset.categoryId || '',
        status: asset.status,
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
        categoryId: '',
        status: 'IDLE',
        data: {},
      })
      setImages([])
    }
    setError('')
  }, [asset, isOpen])

  const handleSubmit = async () => {
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
      const payload: CreateAssetDto | UpdateAssetDto = {
        name: formData.name,
        code: formData.code || undefined,
        categoryId: formData.categoryId || undefined,
        status: formData.status,
        data: formData.data,
      }

      let result
      if (isEditMode && asset) {
        result = await assetApi.update(asset.id, payload)
      } else {
        result = await assetApi.create(payload)
      }

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError((result as any).error || '保存失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const updateDataField = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value },
    }))
  }

  const renderFieldInput = (field: FieldConfig) => {
    const value = formData.data[field.name]

    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
          />
        )
      case 'TEXTAREA':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
            rows={3}
          />
        )
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={`请输入${field.label}`}
          />
        )
      case 'DATE':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
          />
        )
      case 'SELECT':
        let options: string[] = []
        try {
          options = field.options ? JSON.parse(field.options) : []
        } catch {
          options = field.options?.split(',').map((o) => o.trim()) || []
        }
        return (
          <Select
            value={value || ''}
            onValueChange={(v) => updateDataField(field.name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'MULTISELECT':
        let multiOptions: string[] = []
        try {
          multiOptions = field.options ? JSON.parse(field.options) : []
        } catch {
          multiOptions = field.options?.split(',').map((o) => o.trim()) || []
        }
        const selectedValues: string[] = Array.isArray(value) ? value : value ? [value] : []
        return (
          <div className="flex flex-wrap gap-2">
            {multiOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt)
              return (
                <Button
                  key={opt}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== opt)
                      : [...selectedValues, opt]
                    updateDataField(field.name, newValues)
                  }}
                >
                  {opt}
                </Button>
              )
            })}
          </div>
        )
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

        {/* 基础字段 - 使用字段配置中的标签和必填状态 */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {getSystemFieldConfig('name')?.label || '资产名称'}
            {getSystemFieldConfig('name')?.required && <span className="text-destructive"> *</span>}
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={`请输入${getSystemFieldConfig('name')?.label || '资产名称'}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">
            {getSystemFieldConfig('code')?.label || '资产编号'}
            {getSystemFieldConfig('code')?.required && <span className="text-destructive"> *</span>}
          </Label>
          <Input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            placeholder={`请输入${getSystemFieldConfig('code')?.label || '资产编号'}（可选）`}
          />
        </div>

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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
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
