import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Save, X, Shield, Eye, EyeOff, Lock } from 'lucide-react'
import { fieldApi, FIELD_TYPES } from '../lib/api'
import type { FieldConfig, FieldType, CreateFieldDto, UpdateFieldDto } from '../lib/api'
import { PageInstructions } from '@/components/PageInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// 系统内置字段定义 - Asset 表的基础字段
const SYSTEM_FIELDS: Array<{
  name: string
  label: string
  type: FieldType
  required: boolean
  description: string
}> = [
  { name: 'name', label: '资产名称', type: 'TEXT', required: true, description: '资产的主要名称标识' },
  { name: 'code', label: '资产编号', type: 'TEXT', required: false, description: '资产的唯一编号' },
  { name: 'status', label: '状态', type: 'SELECT', required: true, description: '资产当前状态（在用/闲置/维修/报废）' },
]

// 字段表单组件
function FieldForm({
  field,
  onSave,
  onCancel,
}: {
  field?: FieldConfig | null
  onSave: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(field?.name || '')
  const [label, setLabel] = useState(field?.label || '')
  const [type, setType] = useState<FieldType>(field?.type || 'TEXT')
  const [required, setRequired] = useState(field?.required || false)
  const [visible, setVisible] = useState(field?.visible ?? true)
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
        visible,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">字段名称 (英文标识)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="serial_number"
            required
            disabled={isEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">显示名称 (中文)</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="序列号"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">字段类型</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as FieldType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-muted-foreground">必填字段</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-muted-foreground">显示字段</span>
          </label>
        </div>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <Label htmlFor="options">选项 (每行一个)</Label>
          <Textarea
            id="options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            rows={3}
            placeholder="在用&#10;闲置&#10;维修"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-1" />
          {loading ? '保存中...' : '保存'}
        </Button>
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
      const response: any = await fieldApi.getAll()
      if (response?.success) {
        // 过滤掉系统字段（如果数据库中有的话）
        const customFields = response.data.filter(
          (f: FieldConfig) => !SYSTEM_FIELDS.some(sf => sf.name === f.name)
        )
        setFields(customFields)
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
    const response: any = await fieldApi.create(data)
    if (response?.success) {
      setShowAddForm(false)
      loadFields()
    } else {
      throw new Error(response?.error || '创建失败')
    }
  }

  // 更新字段
  const handleUpdate = async (data: UpdateFieldDto) => {
    if (!editingField) return
    const response: any = await fieldApi.update(editingField.id, data)
    if (response?.success) {
      setEditingField(null)
      loadFields()
    } else {
      throw new Error(response?.error || '更新失败')
    }
  }

  // 删除字段
  const handleDelete = async (field: FieldConfig) => {
    if (!confirm(`确定要删除字段 "${field.label}" 吗？此操作不可恢复。`)) {
      return
    }
    try {
      const response: any = await fieldApi.delete(field.id)
      if (response?.success) {
        loadFields()
      } else {
        alert(response?.error || '删除失败')
      }
    } catch (err: any) {
      alert(err.message || '删除失败')
    }
  }

  // 获取字段类型标签
  const getTypeLabel = (type: FieldType) => {
    return FIELD_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">系统设置</h1>
          <p className="mt-1 text-muted-foreground">管理自定义字段配置</p>
        </div>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title="字段配置说明"
        instructions={[
          '系统字段是数据库内置字段（资产名称、资产编号、状态），不可删除',
          '自定义字段可以完全自由配置和删除',
          '隐藏的字段不会在资产表单和列表中显示',
          '字段顺序决定了在表单中的显示顺序（暂未实现拖拽排序）',
          '下拉选择和多选类型的字段需要配置选项列表'
        ]}
      />

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      {/* 字段列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">字段配置</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            添加字段
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>字段类型</TableHead>
                  <TableHead>字段名称</TableHead>
                  <TableHead>显示名称</TableHead>
                  <TableHead>数据类型</TableHead>
                  <TableHead>必填</TableHead>
                  <TableHead>显示</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 系统内置字段 */}
                {SYSTEM_FIELDS.map((field) => (
                  <TableRow key={field.name} className="bg-muted/30">
                    <TableCell>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="w-3 h-3" />
                        系统
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {field.name}
                    </TableCell>
                    <TableCell>
                      {field.label}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(field.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {field.required ? (
                        <span className="text-green-600">是</span>
                      ) : (
                        <span className="text-muted-foreground">否</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Eye className="w-4 h-4 text-green-600" />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {field.description}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {/* 自定义字段 */}
                {fields.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      暂无自定义字段，点击上方"添加字段"开始配置
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">自定义</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {field.name}
                      </TableCell>
                      <TableCell>
                        {editingField?.id === field.id ? (
                          <div className="py-2">
                            <FieldForm
                              field={field}
                              onSave={handleUpdate}
                              onCancel={() => setEditingField(null)}
                            />
                          </div>
                        ) : (
                          field.label
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(field.type as FieldType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <span className="text-green-600">是</span>
                        ) : (
                          <span className="text-muted-foreground">否</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {field.visible ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingField?.id !== field.id && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setEditingField(field)}
                              title="编辑"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(field)}
                              title="删除"
                              className="hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 添加字段弹窗 */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>添加新字段</DialogTitle>
          </DialogHeader>
          <FieldForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
