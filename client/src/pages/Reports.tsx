import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { assetApi, reportApi, ASSET_STATUS_LABELS, fieldApi } from '../lib/api'
import type { AssetStatus, ReportTemplate, ReportDataItem, CreateReportTemplateDto, FieldConfig, ChartType, Asset } from '../lib/api'
import { EmptyReports } from '@/components/ui/EmptyState'

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  IDLE: '#eab308',
  DAMAGED: '#ef4444',
  SCRAPPED: '#6b7280',
}

interface StatusData {
  name: string
  value: number
  color: string
  statusKey: string // 原始状态值，用于跳转筛选
}

interface MonthlyData {
  month: string
  count: number
  yearMonth: string // 原始年月，用于跳转筛选
}

export function Reports() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  // 自定义报表相关状态
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [customChartData, setCustomChartData] = useState<ReportDataItem[] | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  // 表单状态
  const [formData, setFormData] = useState<CreateReportTemplateDto>({
    name: '',
    description: '',
    chartType: 'bar',
    dimension: 'status',
    dateRange: 'all',
    isDefault: false,
  })

  useEffect(() => {
    loadData()
    loadTemplates()
    loadFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // 获取所有资产（分批加载）
      let allAssets: Asset[] = []
      let page = 1
      const pageSize = 100

      while (true) {
        const response = await assetApi.getAll({ page, pageSize })
        if (response.success) {
          allAssets = allAssets.concat(response.data.data)
          if (response.data.data.length < pageSize) break
          page++
        } else {
          break
        }
      }

      setTotal(allAssets.length)

      // 按状态统计
      const statusCount: Record<string, number> = {
        ACTIVE: 0,
        IDLE: 0,
        DAMAGED: 0,
        SCRAPPED: 0,
      }
      allAssets.forEach((asset) => {
        if (Object.prototype.hasOwnProperty.call(statusCount, asset.status)) {
          statusCount[asset.status]++
        }
      })

      const statusArray = Object.entries(statusCount)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: ASSET_STATUS_LABELS[status as AssetStatus] || status,
          value: count,
          color: STATUS_COLORS[status] || '#8884d8',
          statusKey: status,
        }))

      setStatusData(statusArray)

      // 按月统计新增资产
      const monthCount: Record<string, number> = {}
      allAssets.forEach((asset) => {
        const date = new Date(asset.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthCount[monthKey] = (monthCount[monthKey] || 0) + 1
      })

      const monthArray = Object.entries(monthCount)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // 最近6个月
        .map(([month, count]) => ({
          month: month.substring(5) + '月',
          count,
          yearMonth: month,
        }))

      setMonthlyData(monthArray)
    } catch (err) {
      console.error(t('reports.loadFailed'), err)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await reportApi.getTemplates()
      if (response.success) {
        setTemplates(response.data)
        // 自动加载默认模板
        const defaultTemplate = response.data.find((t) => t.isDefault)
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id)
          loadCustomReport(defaultTemplate)
        }
      }
    } catch (err) {
      console.error(t('reports.templateLoadFailed'), err)
    }
  }

  const loadFields = async () => {
    try {
      const response = await fieldApi.getAll()
      if (response.success) {
        setFields(response.data)
      }
    } catch (err) {
      console.error('加载字段配置失败:', err)
    }
  }

  const loadCustomReport = async (template: ReportTemplate) => {
    try {
      const response = await reportApi.getData({
        dimension: template.dimension,
        chartType: template.chartType,
        filters: template.filters || undefined,
        dateRange: template.dateRange || undefined,
        customStartDate: template.customStartDate || undefined,
        customEndDate: template.customEndDate || undefined,
      })
      if (response.success) {
        setCustomChartData(response.data)
      }
    } catch (err) {
      console.error('加载报表数据失败:', err)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      loadCustomReport(template)
    }
  }

  // 图表联动 - 点击状态饼图跳转到资产列表
  const handleStatusChartClick = (data: StatusData) => {
    navigate(`/assets?status=${data.statusKey}`)
  }

  // 图表联动 - 点击月度趋势柱状图跳转到资产列表
  const handleMonthlyChartClick = (data: MonthlyData) => {
    // 计算该月的起始和结束日期
    const [year, month] = data.yearMonth.split('-')
    const startDate = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month}-${lastDay}`
    navigate(`/assets?startDate=${startDate}&endDate=${endDate}`)
  }

  // 图表联动 - 点击自定义报表图表跳转到资产列表
  const handleCustomChartClick = (data: ReportDataItem) => {
    const template = templates.find((t) => t.id === selectedTemplateId)
    if (!template) return

    // 根据维度构建筛选条件
    const filters: Record<string, string> = {}

    if (template.dimension === 'status') {
      // 反向查找状态值
      const statusEntry = Object.entries(ASSET_STATUS_LABELS).find(
        ([, label]) => label === data.label
      )
      if (statusEntry) {
        filters.status = statusEntry[0]
      }
    } else if (template.dimension === 'categoryId') {
      // 分类筛选需要通过搜索
      navigate(`/assets?search=${encodeURIComponent(data.label)}`)
      return
    } else if (template.dimension === 'createdAt') {
      // 月份筛选
      const [year, month] = data.label.split('-')
      if (year && month) {
        const startDate = `${year}-${month}-01`
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const endDate = `${year}-${month}-${lastDay}`
        navigate(`/assets?startDate=${startDate}&endDate=${endDate}`)
        return
      }
    } else {
      // 动态字段筛选
      navigate(`/assets?search=${encodeURIComponent(data.label)}`)
      return
    }

    const filterStr = Object.keys(filters).length > 0 ? JSON.stringify(filters) : ''
    navigate(`/assets?filters=${encodeURIComponent(filterStr)}`)
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      chartType: 'bar',
      dimension: 'status',
      dateRange: 'all',
      isDefault: false,
    })
    setShowTemplateModal(true)
  }

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      chartType: template.chartType as ChartType,
      dimension: template.dimension,
      filters: template.filters || '',
      dateRange: template.dateRange || 'all',
      customStartDate: template.customStartDate || '',
      customEndDate: template.customEndDate || '',
      isDefault: template.isDefault,
    })
    setShowTemplateModal(true)
  }

  const handleSaveTemplate = async () => {
    try {
      if (!formData.name || !formData.chartType || !formData.dimension) {
        alert('请填写报表名称、图表类型和数据维度')
        return
      }

      if (editingTemplate) {
        await reportApi.updateTemplate(editingTemplate.id, formData)
      } else {
        await reportApi.createTemplate(formData)
      }

      setShowTemplateModal(false)
      loadTemplates()
    } catch (err) {
      console.error('保存报表模板失败:', err)
      alert('保存失败')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('确定要删除此报表模板吗？')) return

    try {
      await reportApi.deleteTemplate(id)
      if (selectedTemplateId === id) {
        setSelectedTemplateId('')
        setCustomChartData(null)
      }
      loadTemplates()
    } catch (err) {
      console.error('删除报表模板失败:', err)
    }
  }

  const handleExportReport = () => {
    if (!customChartData) return

    // 导出为 CSV
    const csvContent = [
      ['名称', '数量'],
      ...customChartData.map((item) => [item.label, item.value]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `报表_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDimensionLabel = (dimension: string) => {
    switch (dimension) {
      case 'status':
        return t('reports.dimensionStatus')
      case 'categoryId':
        return t('reports.dimensionCategory')
      case 'createdAt':
        return t('reports.dimensionMonth')
      default: {
        const field = fields.find((f) => f.name === dimension)
        return field?.label || dimension
      }
    }
  }

  const renderCustomChart = () => {
    if (!customChartData || customChartData.length === 0) {
      return <EmptyReports />
    }

    const template = templates.find((t) => t.id === selectedTemplateId)
    const chartData = customChartData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }))

    switch (template?.chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(_: unknown, index: number) => handleCustomChartClick(customChartData[index])}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={t('reports.count')}
                stroke="#3b82f6"
                strokeWidth={2}
                onClick={(data: { index?: number }) => {
                  if (data && data.index !== undefined) {
                    handleCustomChartClick(customChartData[data.index])
                  }
                }}
                className="cursor-pointer"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar
                dataKey="value"
                name={t('reports.count')}
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                onClick={(data: { index?: number }) => {
                  if (data && data.index !== undefined) {
                    handleCustomChartClick(customChartData[data.index])
                  }
                }}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{t('reports.subtitle')}</p>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.totalAssets')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
        </div>
        {statusData.map((item) => (
          <div
            key={item.name}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* 基础图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 状态分布饼图 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.statusDistribution')} <span className="text-sm font-normal text-gray-500">({t('reports.clickForDetails')})</span></h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(_: unknown, index: number) => handleStatusChartClick(statusData[index])}
                  className="cursor-pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyReports />
          )}
        </div>

        {/* 月度新增趋势 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.monthlyTrend')} <span className="text-sm font-normal text-gray-500">({t('reports.clickForDetails')})</span></h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="count"
                  name={t('reports.newCount')}
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  onClick={(data: { index?: number }) => {
                    if (data && data.index !== undefined) {
                      handleMonthlyChartClick(monthlyData[data.index])
                    }
                  }}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyReports />
          )}
        </div>
      </div>

      {/* 自定义报表区域 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.customReport')}</h2>
          <div className="flex gap-2">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('reports.selectTemplate')}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.isDefault ? ` (${t('reports.default')})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              {t('reports.newReport')}
            </button>
            {selectedTemplateId && (
              <>
                <button
                  onClick={() => {
                    const template = templates.find((t) => t.id === selectedTemplateId)
                    if (template) handleEditTemplate(template)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  {t('reports.exportCSV')}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplateId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>
        </div>

        {selectedTemplateId && customChartData ? (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('reports.dataDimension')}: {getDimensionLabel(templates.find((t) => t.id === selectedTemplateId)?.dimension || '')}
            </p>
            {renderCustomChart()}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            {templates.length > 0 ? t('reports.selectTemplatePrompt') : t('reports.createTemplatePrompt')}
          </div>
        )}
      </div>

      {/* 报表模板编辑对话框 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTemplate ? t('reports.editTemplate') : t('reports.createTemplate')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reports.reportName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('reports.reportNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reports.description')}
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('reports.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reports.chartType')} *
                </label>
                <select
                  value={formData.chartType}
                  onChange={(e) => setFormData({ ...formData, chartType: e.target.value as ChartType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="bar">{t('reports.barChart')}</option>
                  <option value="pie">{t('reports.pieChart')}</option>
                  <option value="line">{t('reports.lineChart')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reports.dataDimension')} *
                </label>
                <select
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="status">{t('reports.dimensionStatus')}</option>
                  <option value="categoryId">{t('reports.dimensionCategory')}</option>
                  <option value="createdAt">{t('reports.dimensionMonth')}</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.name}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reports.dateRange')}
                </label>
                <select
                  value={formData.dateRange || 'all'}
                  onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('reports.rangeAll')}</option>
                  <option value="today">{t('reports.rangeToday')}</option>
                  <option value="week">{t('reports.rangeWeek')}</option>
                  <option value="month">{t('reports.rangeMonth')}</option>
                  <option value="year">{t('reports.rangeYear')}</option>
                  <option value="custom">{t('reports.rangeCustom')}</option>
                </select>
              </div>

              {formData.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('reports.startDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.customStartDate || ''}
                      onChange={(e) => setFormData({ ...formData, customStartDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('reports.endDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.customEndDate || ''}
                      onChange={(e) => setFormData({ ...formData, customEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-500 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('reports.setAsDefault')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
