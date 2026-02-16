import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Database, TrendingUp, AlertCircle } from 'lucide-react'
import { assetApi, logApi } from '../lib/api'
import { PageInstructions } from '@/components/PageInstructions'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      const assetsRes: any = await assetApi.getAll({ pageSize: 1 })
      const totalAssets = assetsRes.data?.total || 0

      // 获取本月新增
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyRes: any = await assetApi.getAll({
        pageSize: 1,
        filters: JSON.stringify({
          createdAt: {
            operator: 'gte',
            value: firstDayOfMonth.toISOString()
          }
        })
      })
      const monthlyNew = monthlyRes.data?.total || 0

      // 获取导入记录数
      const logsRes: any = await logApi.getAll({ action: 'IMPORT', pageSize: 1 })
      const importRecords = logsRes.data?.total || 0

      // 获取闲置资产数作为待处理
      const idleRes: any = await assetApi.getAll({ status: 'IDLE', pageSize: 1 })
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
    { label: '资产总数', value: stats.totalAssets, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: '本月新增', value: stats.monthlyNew, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: '导入记录', value: stats.importRecords, icon: Database, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: '闲置资产', value: stats.pending, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          仪表盘
        </h1>
        <p className="mt-1 text-muted-foreground">
          欢迎使用资产录入管理系统
        </p>
      </div>

      {/* 使用说明 */}
      <PageInstructions
        title="仪表盘使用说明"
        instructions={[
          '查看资产总数、本月新增、导入记录和闲置资产等统计数据',
          '通过快速操作卡片可以快速跳转到常用功能页面',
          '点击统计数据卡片可以查看更多详细信息（暂未实现）'
        ]}
      />

      {/* Stats */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              asChild
              className="h-auto py-4 justify-start"
            >
              <Link to="/assets">
                <Package className="w-5 h-5 mr-3 text-primary" />
                <span className="font-medium">管理资产</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-auto py-4 justify-start"
            >
              <Link to="/import">
                <Database className="w-5 h-5 mr-3 text-primary" />
                <span className="font-medium">导入数据</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-auto py-4 justify-start"
            >
              <Link to="/settings">
                <TrendingUp className="w-5 h-5 mr-3 text-primary" />
                <span className="font-medium">配置字段</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
