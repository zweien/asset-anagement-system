import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { logApi, LOG_ACTION_LABELS, type LogAction, type OperationLog, type LogQueryParams } from '../lib/api'
import { EmptyLogs } from '@/components/ui/EmptyState'

export function Logs() {
  const { t } = useTranslation()

  // 实体类型标签使用翻译
  const ENTITY_TYPE_LABELS: Record<string, string> = {
    Asset: t('logs.entityAsset'),
    FieldConfig: t('logs.entityFieldConfig'),
    Category: t('logs.entityCategory'),
    User: t('logs.entityUser'),
  }

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  // 筛选条件
  const [filterAction, setFilterAction] = useState('')
  const [filterEntityType, setFilterEntityType] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // 详情弹窗
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null)

  useEffect(() => {
    loadLogs()
  }, [page, filterAction, filterEntityType, filterStartDate, filterEndDate])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params: LogQueryParams = { page, pageSize }

      if (filterAction) params.action = filterAction
      if (filterEntityType) params.entityType = filterEntityType
      if (filterStartDate) params.startDate = filterStartDate
      if (filterEndDate) params.endDate = filterEndDate

      const response = await logApi.getAll(params)
      if (response.success) {
        setLogs(response.data.data)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      console.error(t('logs.loadFailed'), err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilterAction('')
    setFilterEntityType('')
    setFilterStartDate('')
    setFilterEndDate('')
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionColor = (action: LogAction) => {
    const colors: Record<LogAction, string> = {
      CREATE: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      UPDATE: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      DELETE: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
      IMPORT: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      EXPORT: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
      LOGIN: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
      LOGOUT: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[action] || ''
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('logs.title')}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{t('logs.subtitle')}</p>
      </div>

      {/* 筛选条件 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 操作类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('logs.action')}
            </label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.all')}</option>
              {Object.entries(LOG_ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 实体类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('logs.entity')}
            </label>
            <select
              value={filterEntityType}
              onChange={(e) => {
                setFilterEntityType(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.all')}</option>
              {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('logs.startDate')}
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('logs.endDate')}
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 清除按钮 */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t('assets.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        ) : logs.length === 0 ? (
          <EmptyLogs />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('logs.time')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('logs.action')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('logs.entity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('logs.operator')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('logs.ipAddress')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                            log.action
                          )}`}
                        >
                          {LOG_ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.userName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {log.ip || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t('logs.details')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('logs.totalRecords', { count: total })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('logs.prevPage')}
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('logs.nextPage')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('logs.detailTitle')}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.time')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedLog.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.actionType')}</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                        selectedLog.action
                      )}`}
                    >
                      {LOG_ACTION_LABELS[selectedLog.action] || selectedLog.action}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.entity')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {ENTITY_TYPE_LABELS[selectedLog.entityType] || selectedLog.entityType}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.entityId')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {selectedLog.entityId || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.operator')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedLog.userName || '-'} ({selectedLog.userId || t('logs.unknown')})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.ipAddress')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedLog.ip || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.userAgent')}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                    {selectedLog.userAgent || '-'}
                  </dd>
                </div>
                {selectedLog.oldValue && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.oldValue')}</dt>
                    <dd className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-900 dark:text-white overflow-x-auto">
                      <pre>{JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)}</pre>
                    </dd>
                  </div>
                )}
                {selectedLog.newValue && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('logs.newValue')}</dt>
                    <dd className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-900 dark:text-white overflow-x-auto">
                      <pre>{JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)}</pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
