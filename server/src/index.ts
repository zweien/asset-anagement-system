import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from 'dotenv'
import routes from './routes'
import { AuthService } from './services/auth.service'
import { xssSanitize } from './middleware/xss.middleware'

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

// XSS 防护中间件
app.use(xssSanitize)

// API 路由
app.use('/api', routes)

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' })
})

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message })
})

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📍 Fields API: http://localhost:${PORT}/api/fields`)

  // 创建默认管理员账户
  await AuthService.createDefaultAdmin()
})

export default app
