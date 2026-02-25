import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import routes from './routes'
import { AuthService } from './services/auth.service'
import { xssSanitize } from './middleware/xss.middleware'
import { requestLogger, errorLogger } from './middleware/logger.middleware'
import { swaggerSpec } from './config/swagger'
import logger from './utils/logger'

config()

const app = express()
const PORT = process.env.PORT || 3002

// 中间件
// Helmet 安全配置：HTTPS 下启用完整安全策略
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],  // 允许 API 请求
      imgSrc: ["'self'", "data:", "blob:"],  // 允许图片
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // TailwindCSS 需要 inline styles
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
}))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务 - 用于访问上传的文件（Logo、头像等）
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 静态文件服务 - 用于生产环境服务前端构建产物
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(process.cwd(), 'public')
  app.use(express.static(publicPath))

  // SPA fallback - 所有非 API 路由返回 index.html
  app.get('*', (_req, res, next) => {
    // 跳过 API 和静态资源路由
    if (_req.path.startsWith('/api') || _req.path.startsWith('/uploads')) {
      return next()
    }
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}

// 请求日志中间件
app.use(requestLogger)

// XSS 防护中间件
app.use(xssSanitize)

// API 路由
app.use('/api', routes)

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '资产管理系统 API 文档',
}))

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' })
})

// 错误日志中间件
app.use(errorLogger)

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack })
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message })
})

// 启动服务器
app.listen(PORT, async () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`)
  logger.info(`📍 Health check: http://localhost:${PORT}/api/health`)
  logger.info(`📍 API Docs: http://localhost:${PORT}/api-docs`)
  logger.info(`📍 Fields API: http://localhost:${PORT}/api/fields`)

  // 创建默认管理员账户
  await AuthService.createDefaultAdmin()
})

export default app
