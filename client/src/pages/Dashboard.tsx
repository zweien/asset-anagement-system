import { useState, useEffect } from 'react'
import { Package, Database, TrendingUp, AlertCircle } from 'lucide-react'
import { assetApi, logApi } from '../lib/api'

interface Stats {
  totalAssets: number
  monthlyNew: number
  importRecords: number
  pending: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    monthlyNew: 0,
    importRecords: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // 获取资产统计
      const assetsRes = await assetApi.getAll({ pageSize: 1 })
      const totalAssets = assetsRes.data?.total || 0

      // 获取本月新增
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyRes = await assetApi.getAll({
        pageSize: 1,
        startDate: firstDayOfMonth.toISOString()
      })
      const monthlyNew = monthlyRes.data?.total || 0

      // 获取导入记录数
      const logsRes = await logApi.getAll({ action: 'IMPORT', pageSize: 1 })
      const importRecords = logsRes.data?.total || 0

      // 获取闲置资产数作为待处理
      const idleRes = await assetApi.getAll({ status: 'IDLE', pageSize: 1 })
      const pending = idleRes.data?.total || 0

      setStats({
        totalAssets,
        monthlyNew,
        importRecords,
        pending,
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const statItems = [
    { label: '资产总数', value: stats.totalAssets, icon: Package, color: 'bg-blue-500' },
    { label: '本月新增', value: stats.monthlyNew, icon: TrendingUp, color: 'bg-green-500' },
    { label: '导入记录', value: stats.importRecords, icon: Database, color: 'bg-purple-500' },
    { label: '闲置资产', value: stats.pending, icon: AlertCircle, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          仪表盘
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          欢迎使用资产录入管理系统
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速操作
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/assets"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              管理资产
            </span>
          </a>
          <a
            href="/import"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Database className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              导入数据
            </span>
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              配置字段
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
