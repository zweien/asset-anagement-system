import { Package, Database, TrendingUp, AlertCircle } from 'lucide-react'

const stats = [
  { label: '资产总数', value: '0', icon: Package, color: 'bg-blue-500' },
  { label: '本月新增', value: '0', icon: TrendingUp, color: 'bg-green-500' },
  { label: '导入记录', value: '0', icon: Database, color: 'bg-purple-500' },
  { label: '待处理', value: '0', icon: AlertCircle, color: 'bg-orange-500' },
]

export function Dashboard() {
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
        {stats.map((stat) => {
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
                    {stat.value}
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
