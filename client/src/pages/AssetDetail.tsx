import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Calendar, Tag, Image as ImageIcon, X, Save, Camera } from 'lucide-react'
import { assetApi, ASSET_STATUS_LABELS, getToken } from '../lib/api'
import type { Asset, AssetStatus, FieldConfig } from '../lib/api'
import { fieldApi } from '../lib/api'
import { ImageUploader } from '../components/ImageUploader'

const API_BASE = 'http://localhost:3002/api'

interface ImageInfo {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt: string
}

export function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [images, setImages] = useState<ImageInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    status: 'IDLE' as AssetStatus,
    data: {} as Record<string, unknown>,
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [assetRes, fieldsRes] = await Promise.all([
        assetApi.getById(id),
        fieldApi.getAll(),
      ])

      if (assetRes.success) {
        setAsset(assetRes.data)
        // 初始化编辑表单 - data 可能是对象或 JSON 字符串
        const assetData = typeof assetRes.data.data === 'string'
          ? JSON.parse(assetRes.data.data || '{}')
          : (assetRes.data.data || {})
        setEditForm({
          name: assetRes.data.name,
          code: assetRes.data.code || '',
          status: assetRes.data.status,
          data: assetData,
        })
        // 加载图片
        const token = getToken()
        const imagesRes = await fetch(`${API_BASE}/assets/${id}/images`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const imagesData = await imagesRes.json()
        if (imagesData.success) {
          setImages(imagesData.data)
        }
      } else {
        setError('资产不存在')
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

  const handleDelete = async () => {
    if (!asset || !confirm('确定要删除这个资产吗？')) return

    try {
      const result = await assetApi.delete(asset.id)
      if (result.success) {
        navigate('/assets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleSave = async () => {
    if (!asset) return

    setSaving(true)
    try {
      const result = await assetApi.update(asset.id, {
        name: editForm.name,
        code: editForm.code || undefined,
        status: editForm.status,
        data: editForm.data,
      })

      if (result.success) {
        setAsset(result.data)
        setIsEditing(false)
      } else {
        setError('保存失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (asset) {
      const assetData = typeof asset.data === 'string'
        ? JSON.parse(asset.data || '{}')
        : (asset.data || {})
      setEditForm({
        name: asset.name,
        code: asset.code || '',
        status: asset.status,
        data: assetData,
      })
    }
    setIsEditing(false)
  }

  const updateDataField = (fieldName: string, value: unknown) => {
    setEditForm(prev => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value }
    }))
  }

  const getFieldValue = (fieldName: string): unknown => {
    if (!asset?.data) return null
    try {
      const data = typeof asset.data === 'string' ? JSON.parse(asset.data) : asset.data
      return (data as Record<string, unknown>)[fieldName]
    } catch {
      return null
    }
  }

  const renderFieldInput = (field: FieldConfig) => {
    const value = (editForm.data[field.name] ?? '') as string | number | string[]

    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateDataField(field.name, e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )
      case 'DATE':
        return (
          <input
            type="date"
            value={value ? new Date(value as string).toISOString().split('T')[0] : ''}
            onChange={(e) => updateDataField(field.name, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )
      case 'SELECT': {
        const options = field.options ? JSON.parse(field.options) : []
        return (
          <select
            value={value}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">请选择</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      }
      case 'MULTISELECT': {
        const multiOptions = field.options ? JSON.parse(field.options) : []
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="flex flex-wrap gap-2">
            {multiOptions.map((opt: string) => (
              <label key={opt} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateDataField(field.name, [...selectedValues, opt])
                    } else {
                      updateDataField(field.name, selectedValues.filter((v: string) => v !== opt))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )
      }
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateDataField(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )
    }
  }

  const getStatusColor = (status: AssetStatus) => {
    const colors: Record<AssetStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      IDLE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DAMAGED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      SCRAPPED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }
    return colors[status]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="p-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error || '资产不存在'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowImageUpload(true)}
                className="px-4 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
              >
                <Camera className="w-4 h-4" />
                添加照片
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </>
          )}
        </div>
      </div>

      {/* 资产信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    资产名称 *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      资产编号
                    </label>
                    <input
                      type="text"
                      value={editForm.code}
                      onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      状态
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as AssetStatus }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{asset.name}</h1>
                {asset.code && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">编号: {asset.code}</p>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`}>
              {ASSET_STATUS_LABELS[asset.status]}
            </span>
          )}
        </div>

        {/* 基础信息 */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tag className="w-4 h-4" />
              <span>分类: {asset.category?.name || '未分类'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>创建时间: {new Date(asset.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        )}

        {/* 动态字段 */}
        {fields.filter(f => !['name', 'code', 'status'].includes(f.name) && f.visible !== false).length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields
                .filter(f => !['name', 'code', 'status'].includes(f.name) && f.visible !== false)
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const value = isEditing ? editForm.data[field.name] : getFieldValue(field.name)
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400">{field.label}</label>
                      {isEditing ? (
                        renderFieldInput(field)
                      ) : (
                        <div className="text-gray-900 dark:text-white">
                          {value === null || value === undefined || value === '' ? (
                            <span className="text-gray-400">-</span>
                          ) : field.type === 'DATE' ? (
                            new Date(value as string).toLocaleDateString('zh-CN')
                          ) : field.type === 'MULTISELECT' ? (
                            Array.isArray(value) ? value.join(', ') : String(value)
                          ) : (
                            String(value)
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* 图片 */}
      {images.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                资产图片 ({images.length})
              </h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setShowImageUpload(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                管理图片
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={() => window.open(`${API_BASE}/images/${image.id}`, '_blank')}
              >
                <img
                  src={`${API_BASE}/images/${image.id}`}
                  alt={image.originalName}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {image.originalName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片上传模态框 */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                管理图片 - {asset.name}
              </h2>
              <button
                onClick={() => setShowImageUpload(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ImageUploader
                assetId={asset.id}
                images={images}
                onImagesChange={() => {
                  // 重新加载图片
                  const token = getToken()
                  fetch(`${API_BASE}/assets/${asset.id}/images`, {
                    headers: {
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setImages(data.data)
                      }
                    })
                }}
              />
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowImageUpload(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
