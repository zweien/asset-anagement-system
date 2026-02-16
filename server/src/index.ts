import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from 'dotenv'
import swaggerUi from 'swagger-ui-express'
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
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
