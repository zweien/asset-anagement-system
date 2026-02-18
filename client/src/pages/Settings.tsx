import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, GripVertical, Save, X, Shield, Eye, EyeOff, Lock, Image, Upload } from 'lucide-react'
import { fieldApi, FIELD_TYPES, systemConfigApi, hasPermission, getStoredUser } from '../lib/api'
import type { FieldConfig, FieldType, CreateFieldDto, UpdateFieldDto, UserRole } from '../lib/api'
import { showSuccess, showError, showWarning } from '../lib/toast'
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

const API_BASE = 'http://localhost:3002'

// 字段表单组件
function FieldForm({
  field,
  onSave,
  onCancel,
  isSystem = false,
}: {
  field?: FieldConfig | null
  onSave: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>
  onCancel: () => void
  isSystem?: boolean
}) {
  const { t } = useTranslation()
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
      const data: CreateFieldDto = {
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
            .map((o: string) => o.trim())
            .filter(Boolean)
        )
      }

      await onSave(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
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

      {isSystem && (
        <div className="p-3 text-sm text-muted-foreground bg-muted rounded-lg flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('settings.systemFieldNote')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('settings.fieldName')}</Label>
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
          <Label htmlFor="label">{t('settings.fieldLabel')}</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('settings.fieldLabelPlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('settings.fieldType')}</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as FieldType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((ft) => (
                <SelectItem key={ft.value} value={ft.value}>
                  {ft.label}
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
            <span className="text-sm text-muted-foreground">{t('settings.required')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-muted-foreground">{t('settings.visible')}</span>
          </label>
        </div>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <Label htmlFor="options">{t('settings.optionsLabel')}</Label>
          <Textarea
            id="options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            rows={3}
            placeholder={t('settings.optionsPlaceholder')}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-1" />
          {loading ? t('common.processing') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}

// 主设置页面
export function Settings() {
  const { t } = useTranslation()
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingField, setEditingField] = useState<FieldConfig | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // 系统设置状态
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')
  const [systemNameInput, setSystemNameInput] = useState<string>('')
  const [savingName, setSavingName] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // 权限检查
  const currentUser = getStoredUser()
  const isAdmin = hasPermission(currentUser?.role as UserRole, 'user:manage')

  // 加载系统配置
  const loadSystemConfig = async () => {
    try {
      const response = await systemConfigApi.getPublicConfig()
      if (response.success) {
        setSystemLogo(response.data.logo)
        setSystemName(response.data.name)
        setSystemNameInput(response.data.name)
      }
    } catch (err) {
      console.error('加载系统配置失败:', err)
    }
  }

  // 上传 Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      showError(t('settings.invalidFileType'))
      return
    }

    // 验证文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError(t('settings.fileTooLarge'))
      return
    }

    try {
      const response = await systemConfigApi.uploadLogo(file)
      if (response.success) {
        setSystemLogo(response.data.logo)
        showSuccess(t('settings.logoUploadSuccess'))
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('settings.logoUploadFailed'))
    }

    // 清空 input
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  // 更新系统名称
  const handleSaveSystemName = async () => {
    if (!systemNameInput.trim()) return

    setSavingName(true)
    try {
      const response = await systemConfigApi.setSystemName(systemNameInput.trim())
      if (response.success) {
        setSystemName(systemNameInput.trim())
        showSuccess(t('settings.systemNameUpdateSuccess'))
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('settings.systemNameUpdateFailed'))
    } finally {
      setSavingName(false)
    }
  }

  // 加载字段列表
  const loadFields = async () => {
    try {
      setLoading(true)
      const response = await fieldApi.getAll()
      if (response?.success) {
        // 按 order 排序，系统字段在前
        const sortedFields = response.data.sort((a: FieldConfig, b: FieldConfig) => a.order - b.order)
        setFields(sortedFields)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFields()
    loadSystemConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 添加字段
  const handleAdd = async (data: CreateFieldDto | UpdateFieldDto) => {
    const response = await fieldApi.create(data as CreateFieldDto)
    if (response?.success) {
      setShowAddForm(false)
      loadFields()
    } else {
      throw new Error((response as { error?: string })?.error || t('common.error'))
    }
  }

  // 更新字段
  const handleUpdate = async (data: UpdateFieldDto) => {
    if (!editingField) return
    const response = await fieldApi.update(editingField.id, data)
    if (response?.success) {
      setEditingField(null)
      loadFields()
    } else {
      throw new Error((response as { error?: string })?.error || t('common.error'))
    }
  }

  // 删除字段
  const handleDelete = async (field: FieldConfig) => {
    if (field.isSystem) {
      showWarning(t('settings.systemFieldNoDelete'))
      return
    }
    if (!confirm(t('settings.confirmDeleteField'))) {
      return
    }
    try {
      const response = await fieldApi.delete(field.id)
      if (response?.success) {
        showSuccess(t('settings.fieldDeleteSuccess'))
        loadFields()
      } else {
        showError(t('common.error'), (response as { error?: string })?.error || '')
      }
    } catch (err: unknown) {
      showError(t('common.error'), err instanceof Error ? err.message : '')
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
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title={t('settings.fieldConfig')}
        instructions={[
          t('settings.instruction1'),
          t('settings.instruction2'),
          t('settings.instruction3'),
          t('settings.instruction4'),
          t('settings.instruction5'),
        ]}
      />

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      {/* 系统设置卡片（仅管理员可见） */}
      {isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              {t('settings.systemSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 系统Logo */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {systemLogo ? (
                  <img
                    src={`${API_BASE}${systemLogo}`}
                    alt={systemName || 'Logo'}
                    className="w-16 h-16 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">{t('settings.systemLogo')}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('settings.uploadLogo')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {t('settings.uploadLogo')}
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* 系统名称 */}
            <div className="space-y-2">
              <Label htmlFor="system-name" className="text-sm font-medium">
                {t('settings.systemName')}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="system-name"
                  value={systemNameInput}
                  onChange={(e) => setSystemNameInput(e.target.value)}
                  placeholder={t('header.appName')}
                  className="max-w-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSaveSystemName}
                  disabled={savingName || systemNameInput === systemName}
                >
                  {savingName ? t('common.processing') : t('common.save')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 字段列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">{t('settings.fieldConfig')}</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            {t('settings.addField')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : fields.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t('settings.noFields')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>{t('settings.fieldCategory')}</TableHead>
                  <TableHead>{t('settings.fieldName')}</TableHead>
                  <TableHead>{t('settings.fieldLabel')}</TableHead>
                  <TableHead>{t('settings.fieldType')}</TableHead>
                  <TableHead>{t('settings.required')}</TableHead>
                  <TableHead>{t('settings.visible')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow
                    key={field.id}
                    className={field.isSystem ? 'bg-muted/30' : ''}
                  >
                    <TableCell>
                      {field.isSystem ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      )}
                    </TableCell>
                    <TableCell>
                      {field.isSystem ? (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          {t('settings.systemField')}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{t('settings.customField')}</Badge>
                      )}
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
                            isSystem={field.isSystem}
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
                        <span className="text-green-600">{t('settings.yes')}</span>
                      ) : (
                        <span className="text-muted-foreground">{t('settings.no')}</span>
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
                            title={t('common.edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(field)}
                            title={t('common.delete')}
                            disabled={field.isSystem}
                            className={field.isSystem ? 'opacity-50' : 'hover:text-destructive'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 添加字段弹窗 */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('settings.addField')}</DialogTitle>
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
