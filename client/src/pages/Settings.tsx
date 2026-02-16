import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Save, X } from 'lucide-react'
import { fieldApi, FIELD_TYPES } from '../lib/api'
import type { FieldConfig, FieldType, CreateFieldDto, UpdateFieldDto } from '../lib/api'

// 字段表单组件
function FieldForm({
  field,
  onSave,
  onCancel,
}: {
  field?: FieldConfig | null
  onSave: (data: CreateFieldDto | UpdateFieldDto) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(field?.name || '')
  const [label, setLabel] = useState(field?.label || '')
  const [type, setType] = useState<FieldType>(field?.type || 'TEXT')
  const [required, setRequired] = useState(field?.required || false)
  const [options, setOptions] = useState(() => {
    if (field?.options) {
      try {
        return JSON.parse(field.options).join('\n')
      } catch {
        return ''
      }
    }
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!field
  const needsOptions = type === 'SELECT' || type === 'MULTISELECT'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data: CreateFieldDto | UpdateFieldDto = {
        name,
        label,
        type,
        required,
      }

      if (needsOptions && options.trim()) {
        data.options = JSON.stringify(
          options
            .split('\n')
            .map((o) => o.trim())
            .filter(Boolean)
        )
      }

      await onSave(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            字段名称 (英文标识)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="serial_number"
            required
            disabled={isEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            显示名称 (中文)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="序列号"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            字段类型
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FieldType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">必填字段</span>
          </label>
        </div>
      </div>

      {needsOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            选项 (每行一个)
          </label>
          <textarea
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="在用&#10;闲置&#10;维修"
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <X className="w-4 h-4 inline mr-1" />
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 inline mr-1" />
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}

// 主设置页面
export function Settings() {
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingField, setEditingField] = useState<FieldConfig | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // 加载字段列表
  const loadFields = async () => {
    try {
      setLoading(true)
      const response = await fieldApi.getAll()
      if (response.success) {
        setFields(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFields()
  }, [])

  // 添加字段
  const handleAdd = async (data: CreateFieldDto) => {
    const response = await fieldApi.create(data)
    if (response.success) {
      setShowAddForm(false)
      loadFields()
    }
  }

  // 更新字段
  const handleUpdate = async (data: UpdateFieldDto) => {
    if (!editingField) return
    const response = await fieldApi.update(editingField.id, data)
    if (response.success) {
      setEditingField(null)
      loadFields()
    }
  }

  // 删除字段
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个字段吗？')) return
    try {
      await fieldApi.delete(id)
      loadFields()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  // 获取字段类型标签
  const getTypeLabel = (type: FieldType) => {
    return FIELD_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          管理自定义字段配置
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">自定义字段</h2>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          添加字段
        </button>
      </div>

      {/* 添加字段表单 */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            添加新字段
          </h3>
          <FieldForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* 字段列表 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            加载中...
          </div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            暂无字段配置，点击上方"添加字段"开始配置
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  字段名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  显示名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  必填
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                    {field.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {editingField?.id === field.id ? (
                      <FieldForm
                        field={field}
                        onSave={handleUpdate}
                        onCancel={() => setEditingField(null)}
                      />
                    ) : (
                      field.label
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {getTypeLabel(field.type as FieldType)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {field.required ? (
                      <span className="text-green-600 dark:text-green-400">是</span>
                    ) : (
                      <span className="text-gray-400">否</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingField(field)}
                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
