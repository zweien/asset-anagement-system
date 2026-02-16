import { useState, useRef } from 'react'
import { Upload, X, Camera } from 'lucide-react'

interface ImageInfo {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt: string
}

interface ImageUploaderProps {
  assetId: string
  images: ImageInfo[]
  onImagesChange: () => void
}

const API_BASE = 'http://localhost:3002/api'

export function ImageUploader({ assetId, images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE}/assets/${assetId}/images`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        onImagesChange()
      } else {
        setError(result.error || '上传失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('确定要删除这张图片吗？')) return

    try {
      const response = await fetch(`${API_BASE}/images/${imageId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        onImagesChange()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* 已上传的图片 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={`${API_BASE}/images/${image.id}`}
                alt={image.originalName}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                {image.originalName}
                <span className="ml-2">{formatSize(image.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮区域 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 拍照按钮 (移动端显示) */}
        {isMobile && (
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Camera className="w-5 h-5" />
            {uploading ? '上传中...' : '拍照上传'}
          </button>
        )}

        {/* 相册/文件选择按钮 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            isMobile
              ? 'flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              : 'w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500'
          }`}
        >
          <Upload className="w-5 h-5" />
          {uploading ? '上传中...' : isMobile ? '从相册选择' : '点击上传图片'}
        </button>
      </div>

      {/* 文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* 相机输入 (移动端) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* 提示信息 */}
      {!isMobile && (
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          支持 JPEG, PNG, GIF, WebP，最大 10MB
        </p>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
