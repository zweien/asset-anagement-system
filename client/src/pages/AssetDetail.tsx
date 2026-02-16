import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Calendar, Tag, Image as ImageIcon } from 'lucide-react'
import { assetApi, ASSET_STATUS_LABELS } from '../lib/api'
import type { Asset, AssetStatus, FieldConfig } from '../lib/api'
import { fieldApi } from '../lib/api'

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

  useEffect(() => {
    loadData()
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
        // 加载图片
        const imagesRes = await fetch(`${API_BASE}/assets/${id}/images`)
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusColor = (status: AssetStatus) => {
    const colors: Record<AssetStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      IDLE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SCRAPPED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }
    return colors[status]
  }

  const getFieldValue = (fieldName: string): any => {
    if (!asset?.data) return null
    try {
      const data = JSON.parse(asset.data)
      return data[fieldName]
    } catch {
      return null
    }
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
          <button
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
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
        </div>
      </div>

      {/* 资产信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{asset.name}</h1>
            {asset.code && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">编号: {asset.code}</p>
            )}
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`}>
            {ASSET_STATUS_LABELS[asset.status]}
          </span>
        </div>

        {/* 基础信息 */}
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

        {/* 动态字段 */}
        {fields.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const value = getFieldValue(field.name)
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400">{field.label}</label>
                      <div className="text-gray-900 dark:text-white">
                        {value === null || value === undefined ? (
                          <span className="text-gray-400">-</span>
                        ) : field.type === 'DATE' ? (
                          new Date(value as string).toLocaleDateString('zh-CN')
                        ) : field.type === 'MULTISELECT' ? (
                          Array.isArray(value) ? value.join(', ') : String(value)
                        ) : (
                          String(value)
                        )}
                      </div>
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
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              资产图片 ({images.length})
            </h2>
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
    </div>
  )
}
