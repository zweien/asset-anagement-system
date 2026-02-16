import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { assetApi, ASSET_STATUS_LABELS } from '../lib/api'
import type { Asset, FieldConfig, AssetStatus, CreateAssetDto, UpdateAssetDto } from '../lib/api'
import { ImageUploader } from './ImageUploader'

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
    for (const field of fields) {
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
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        )
      case 'TEXTAREA':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            placeholder={`请输入${field.label}`}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        )
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={`请输入${field.label}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        )
      case 'DATE':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        )
      case 'SELECT':
        const options = field.options?.split(',').map((o) => o.trim()) || []
        return (
          <select
            value={value || ''}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">请选择</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      case 'MULTISELECT':
        const multiOptions = field.options?.split(',').map((o) => o.trim()) || []
        const selectedValues: string[] = Array.isArray(value) ? value : value ? [value] : []
        return (
          <div className="flex flex-wrap gap-2">
            {multiOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== opt)
                      : [...selectedValues, opt]
                    updateDataField(field.name, newValues)
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-primary-100 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                  }`}
                >
                  {opt}
                </button>
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
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        {/* 基础字段 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            资产名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="请输入资产名称"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">资产编号</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="请输入资产编号（可选）"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as AssetStatus }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 动态字段 */}
        {fields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {renderFieldInput(field)}
            </div>
          ))}

        {/* 图片上传 (仅编辑模式) */}
        {isEditMode && asset && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              资产图片
            </label>
            <ImageUploader
              assetId={asset.id}
              images={images}
              onImagesChange={loadImages}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : isEditMode ? '保存修改' : '创建资产'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
