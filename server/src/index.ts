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

// 存储服务器实例
let serverInstance: ReturnType<typeof app.listen> | null = null

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

/**
 * 启动服务器
 * @param preferredPort 首选端口，如果不指定则使用环境变量 PORT 或默认 3002
 * @returns 实际使用的端口号
 */
export async function startServer(preferredPort?: number): Promise<number> {
  const PORT = preferredPort ?? parseInt(process.env.PORT || '3002', 10)

  return new Promise((resolve, reject) => {
    try {
      serverInstance = app.listen(PORT, async () => {
        // 获取实际端口（当 PORT=0 时由系统分配）
        const actualPort = (serverInstance?.address() as any)?.port || PORT
        logger.info(`🚀 Server is running on http://localhost:${actualPort}`)
        logger.info(`📍 Health check: http://localhost:${actualPort}/api/health`)
        logger.info(`📍 API Docs: http://localhost:${actualPort}/api-docs`)
        logger.info(`📍 Fields API: http://localhost:${actualPort}/api/fields`)

        // 创建默认管理员账户
        await AuthService.createDefaultAdmin()

        resolve(actualPort)
      })

      serverInstance.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'EADDRINUSE') {
          logger.error(`Port ${PORT} is already in use`)
        }
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * 停止服务器
 */
export async function stopServer(): Promise<void> {
  if (serverInstance) {
    return new Promise((resolve) => {
      serverInstance!.close(() => {
        serverInstance = null
        resolve()
      })
    })
  }
}

// 仅在直接运行时启动（非 Electron 环境，非被导入模块）
const isMainModule = require.main === module || process.env.ELECTRON_MODE !== 'true'
if (isMainModule && process.env.ELECTRON_MODE === undefined) {
  startServer()
}

export default app
