import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Database, Server, Table, Download } from 'lucide-react'
import { fieldApi, dbImportApi, type TableInfo, type DBConnectionConfig } from '../lib/api'
import type { FieldConfig } from '../lib/api'
import api from '../lib/api'
import { PageInstructions } from '@/components/PageInstructions'

interface ParsedData {
  headers: string[]
  preview: Record<string, any>[]
  total: number
}

interface FieldMapping {
  excelColumn: string
  fieldId: string
  fieldName: string
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: { row: number; message: string }[]
}

export function Import() {
  const { t } = useTranslation()
  const [importType, setImportType] = useState<'excel' | 'database'>('excel')

  // Excel 导入状态
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [mapping, setMapping] = useState<FieldMapping[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 数据库导入状态
  const [dbConfig, setDbConfig] = useState<DBConnectionConfig>({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
  })
  const [dbConnected, setDbConnected] = useState(false)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tablePreview, setTablePreview] = useState<Record<string, any>[]>([])
  const [dbMapping, setDbMapping] = useState<{ sourceColumn: string; targetField: string }[]>([])
  const [dbImportResult, setDbImportResult] = useState<{ total: number; imported: number; failed: number; errors: string[] } | null>(null)

  // 加载字段配置
  const loadFields = async () => {
    const result = await fieldApi.getAll()
    if (result.success) {
      setFields(result.data)
    }
  }

  // ========== Excel 导入 ==========

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<{ success: boolean; data: ParsedData }>('/import/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.success) {
        setParsedData(response.data)
        await loadFields()
        setStep(2)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.parseFailed'))
    } finally {
      setLoading(false)
    }
  }

  const updateMapping = (excelColumn: string, fieldId: string, fieldName: string) => {
    setMapping((prev) => {
      const filtered = prev.filter((m) => m.excelColumn !== excelColumn)
      if (fieldId) {
        return [...filtered, { excelColumn, fieldId, fieldName }]
      }
      return filtered
    })
  }

  const executeImport = async () => {
    if (!parsedData || mapping.length === 0) {
      setError(t('import.configureMapping'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post<{ success: boolean; data: ImportResult }>('/import/execute', {
        rows: parsedData.preview,
        mapping,
      })

      if (response.success) {
        setImportResult(response.data)
        setStep(3)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.importError'))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setParsedData(null)
    setMapping([])
    setImportResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ========== 数据库导入 ==========

  const testDbConnection = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await dbImportApi.testConnection(dbConfig)
      if (result.success) {
        setDbConnected(true)
        // 加载表列表
        const tablesResult = await dbImportApi.getTables(dbConfig)
        if (tablesResult.success && tablesResult.data) {
          setTables(tablesResult.data)
        }
        await loadFields()
      } else {
        setError(result.error || t('import.connectionFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.connectionFailed'))
    } finally {
      setLoading(false)
    }
  }

  const loadTablePreview = async (tableName: string) => {
    setLoading(true)
    try {
      const result = await dbImportApi.previewData(dbConfig, tableName)
      if (result.success && result.data) {
        setTablePreview(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.previewFailed'))
    } finally {
      setLoading(false)
    }
  }

  const executeDbImport = async () => {
    if (!selectedTable || dbMapping.length === 0) {
      setError(t('import.selectTableAndMapping'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await dbImportApi.importData(dbConfig, selectedTable, dbMapping)
      if (result.success && result.data) {
        setDbImportResult(result.data)
      } else {
        setError(result.error || t('import.importError'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.importError'))
    } finally {
      setLoading(false)
    }
  }

  const resetDb = () => {
    setDbConnected(false)
    setTables([])
    setSelectedTable('')
    setTablePreview([])
    setDbMapping([])
    setDbImportResult(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('import.title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('import.subtitle')}</p>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title={t('import.instructions.title')}
        instructions={[
          t('import.instructions.1'),
          t('import.instructions.2'),
          t('import.instructions.3'),
          t('import.instructions.4'),
          t('import.instructions.5'),
        ]}
      />

      {/* 导入类型选择 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setImportType('excel')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            importType === 'excel'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
          {t('import.excelImport')}
        </button>
        <button
          onClick={() => setImportType('database')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            importType === 'database'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          {t('import.databaseImport')}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Excel 导入 */}
      {importType === 'excel' && (
        <>
          {/* 步骤指示器 */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                  {s === 1 ? t('import.step1') : s === 2 ? t('import.step2') : t('import.step3')}
                </span>
                {s < 3 && <div className="w-12 h-px bg-gray-300 dark:bg-gray-700" />}
              </div>
            ))}
          </div>

          {/* Step 1: 上传文件 */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('import.uploadExcel')}</h2>
                <button
                  onClick={() => window.open('http://localhost:3002/api/import/template', '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <Download className="w-4 h-4" />
                  {t('import.downloadTemplate')}
                </button>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">{t('import.dragDrop')}</p>
                <p className="text-sm text-gray-500">{t('import.supportedFormats')}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              {loading && <p className="mt-4 text-center text-gray-500">{t('import.parsing')}</p>}
            </div>
          )}

          {/* Step 2: 字段映射 */}
          {step === 2 && parsedData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('import.mapping')}</h2>
                  <p className="text-sm text-gray-500">{t('import.rowCount', { count: parsedData.total })}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-2 text-left text-gray-500">{t('import.excelColumn')}</th>
                        <th className="px-4 py-2 text-left text-gray-500">{t('import.mapToField')}</th>
                        {parsedData.headers.slice(0, 3).map((header) => (
                          <th key={header} className="px-4 py-2 text-left text-gray-500">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.headers.map((header) => (
                        <tr key={header} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                            {header}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={mapping.find((m) => m.excelColumn === header)?.fieldId || ''}
                              onChange={(e) => {
                                const option = e.target.selectedOptions[0]
                                updateMapping(header, e.target.value, option?.textContent || '')
                              }}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="">{t('import.noMapping')}</option>
                              <option value="__name__">{t('assets.assetName')}</option>
                              <option value="__code__">{t('assets.assetCode')}</option>
                              {fields.map((field) => (
                                <option key={field.id} value={field.id}>{field.label}</option>
                              ))}
                            </select>
                          </td>
                          {parsedData.preview.slice(0, 3).map((row, idx) => (
                            <td key={idx} className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {String(row[header] || '-').slice(0, 20)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={reset} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                  {t('import.reUpload')}
                </button>
                <button
                  onClick={executeImport}
                  disabled={loading || mapping.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? t('import.importing') : t('import.startImport')}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 导入结果 */}
          {step === 3 && importResult && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="text-center mb-6">
                {importResult.success ? (
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {importResult.success ? t('import.importComplete') : t('import.importError')}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{importResult.total}</p>
                  <p className="text-sm text-gray-500">{t('import.total')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-gray-500">{t('import.success')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.skipped}</p>
                  <p className="text-sm text-gray-500">{t('import.skipped')}</p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={reset} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {t('import.continueImport')}
                </button>
                <button onClick={() => (window.location.href = '/assets')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  {t('import.viewAssetList')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 数据库导入 */}
      {importType === 'database' && (
        <div className="space-y-6">
          {/* 连接配置 */}
          {!dbImportResult && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Server className="w-5 h-5 inline mr-2" />
                {t('import.dbConnection')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbType')}
                  </label>
                  <select
                    value={dbConfig.type}
                    onChange={(e) => setDbConfig({ ...dbConfig, type: e.target.value as 'mysql' | 'postgresql', port: e.target.value === 'mysql' ? 3306 : 5432 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbHost')}
                  </label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbPort')}
                  </label>
                  <input
                    type="number"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) || 3306 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbName')}
                  </label>
                  <input
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbUsername')}
                  </label>
                  <input
                    type="text"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('import.dbPassword')}
                  </label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={testDbConnection}
                  disabled={loading || !dbConfig.host || !dbConfig.database}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? t('import.connecting') : t('import.testConnection')}
                </button>
                {dbConnected && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('import.connectionSuccess')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 表选择和预览 */}
          {dbConnected && tables.length > 0 && !dbImportResult && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Table className="w-5 h-5 inline mr-2" />
                {t('import.selectTable')}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 表列表 */}
                <div className="space-y-2">
                  {tables.map((table) => (
                    <button
                      key={table.name}
                      onClick={() => {
                        setSelectedTable(table.name)
                        loadTablePreview(table.name)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedTable === table.name
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{table.name}</p>
                      <p className="text-sm text-gray-500">{t('import.tableRows', { count: table.rowCount })}</p>
                    </button>
                  ))}
                </div>

                {/* 字段映射 */}
                {selectedTable && tablePreview.length > 0 && (
                  <div className="lg:col-span-2">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('import.mapping')}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-3 py-2 text-left text-gray-500">{t('import.sourceField')}</th>
                            <th className="px-3 py-2 text-left text-gray-500">{t('import.fieldType')}</th>
                            <th className="px-3 py-2 text-left text-gray-500">{t('import.mapTo')}</th>
                            <th className="px-3 py-2 text-left text-gray-500">{t('import.sampleValue')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(tablePreview[0]).map((column) => (
                            <tr key={column} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{column}</td>
                              <td className="px-3 py-2 text-gray-500">
                                {tables.find(t => t.name === selectedTable)?.columns.find(c => c.name === column)?.type || '-'}
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={dbMapping.find(m => m.sourceColumn === column)?.targetField || ''}
                                  onChange={(e) => {
                                    setDbMapping(prev => {
                                      const filtered = prev.filter(m => m.sourceColumn !== column)
                                      if (e.target.value) {
                                        return [...filtered, { sourceColumn: column, targetField: e.target.value }]
                                      }
                                      return filtered
                                    })
                                  }}
                                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="">{t('import.noMapping')}</option>
                                  <option value="name">{t('assets.assetName')}</option>
                                  <option value="code">{t('assets.assetCode')}</option>
                                  <option value="status">{t('assets.status')}</option>
                                  {fields.map((field) => (
                                    <option key={field.id} value={field.name}>{field.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-gray-500 truncate max-w-32">
                                {String(tablePreview[0][column] || '-').slice(0, 20)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      <button onClick={resetDb} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {t('import.reConnect')}
                      </button>
                      <button
                        onClick={executeDbImport}
                        disabled={loading || dbMapping.length === 0}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {loading ? t('import.importing') : t('import.startImport')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 导入结果 */}
          {dbImportResult && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('import.importComplete')}</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbImportResult.total}</p>
                  <p className="text-sm text-gray-500">{t('import.total')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dbImportResult.imported}</p>
                  <p className="text-sm text-gray-500">{t('import.success')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{dbImportResult.failed}</p>
                  <p className="text-sm text-gray-500">{t('import.failed')}</p>
                </div>
              </div>

              {dbImportResult.errors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('import.errorDetails')}</h3>
                  <div className="max-h-40 overflow-y-auto text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    {dbImportResult.errors.map((err, idx) => (
                      <p key={idx}>{err}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button onClick={resetDb} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {t('import.continueImport')}
                </button>
                <button onClick={() => (window.location.href = '/assets')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  {t('import.viewAssetList')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
