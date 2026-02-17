import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Database, TrendingUp, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { assetApi, logApi } from '../lib/api'
import { PageInstructions } from '@/components/PageInstructions'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { staggerContainer, staggerItem, fadeInUp, transitionPresets } from '@/lib/animations'

interface Stats {
  totalAssets: number
  monthlyNew: number
  importRecords: number
  pending: number
}

export function Dashboard() {
  const { t } = useTranslation()
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
    { label: t('dashboard.totalAssets'), value: stats.totalAssets, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: t('dashboard.monthlyNew'), value: stats.monthlyNew, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: t('dashboard.importRecords'), value: stats.importRecords, icon: Database, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: t('dashboard.idleAssets'), value: stats.pending, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* 使用说明 */}
      <motion.div variants={staggerItem}>
        <PageInstructions
          title={t('dashboard.title')}
          instructions={[
            t('dashboard.totalAssets'),
            t('dashboard.quickActions'),
            t('dashboard.manageAssets'),
          ]}
        />
      </motion.div>

      {/* Stats */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                custom={index}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                        <motion.p
                          className="text-2xl font-bold text-foreground"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, ...transitionPresets.spring }}
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: '/assets', icon: Package, label: t('dashboard.manageAssets') },
                { to: '/import', icon: Database, label: t('dashboard.importData') },
                { to: '/settings', icon: TrendingUp, label: t('dashboard.configureFields') },
              ].map((action, index) => (
                <motion.div
                  key={action.to}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    asChild
                    className="w-full h-auto py-4 justify-start"
                  >
                    <Link to={action.to}>
                      <action.icon className="w-5 h-5 mr-3 text-primary" />
                      <span className="font-medium">{action.label}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
