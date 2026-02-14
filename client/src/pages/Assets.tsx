export function Assets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            资产管理
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            管理和查看所有资产信息
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          新增资产
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          资产列表功能开发中...
        </p>
      </div>
    </div>
  )
}
