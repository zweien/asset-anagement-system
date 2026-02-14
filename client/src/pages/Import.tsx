export function Import() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          数据导入
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          从 Excel 或数据库导入资产数据
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Excel 导入
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            支持 .xlsx 格式文件导入
          </p>
          <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              点击或拖拽文件到此区域
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            数据库导入
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            支持 MySQL、PostgreSQL 连接
          </p>
          <button className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            配置数据库连接
          </button>
        </div>
      </div>
    </div>
  )
}
