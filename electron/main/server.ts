// electron/main/server.ts
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import { getServerPath, getDatabaseUrl, getUploadDir, getLogDir, isDev } from './paths'

let serverProcess: ChildProcess | null = null
let actualPort: number = 0

/**
 * 获取实际使用的端口
 */
export function getActualPort(): number {
  return actualPort
}

/**
 * 启动后端服务
 * 返回实际使用的端口号
 */
export async function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath()

    // 设置环境变量
    const env = {
      ...process.env,
      DATABASE_URL: getDatabaseUrl(),
      UPLOAD_DIR: getUploadDir(),
      LOG_DIR: getLogDir(),
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_MODE: 'true',
      // 为 Electron 桌面应用生成固定的 JWT 密钥
      // 注意：在实际生产部署中应该使用更安全的方式管理密钥
      JWT_SECRET: process.env.JWT_SECRET || 'electron-desktop-app-jwt-secret-key-v1',
    }

    // 使用端口 0 让系统自动分配空闲端口
    const portToUse = '0'

    // 获取项目根目录（server 的父目录）
    const projectRoot = isDev
      ? path.resolve(__dirname, '..', '..')
      : path.resolve(process.resourcesPath, '..')

    serverProcess = spawn('node', [serverPath], {
      env: { ...env, PORT: portToUse },
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot, // 使用项目根目录作为工作目录
    })

    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`[Server stdout] ${output.trim()}`)

      // 解析端口号 - 特殊格式 [SERVER_PORT]1234[/SERVER_PORT]
      const portMatch = output.match(/\[SERVER_PORT\](\d+)\[\/SERVER_PORT\]/)
      if (portMatch && actualPort === 0) {
        actualPort = parseInt(portMatch[1], 10)
        console.log(`[Electron] Detected server port: ${actualPort}`)
        resolve(actualPort)
      }

      // 也尝试解析 localhost:端口 格式
      const localhostMatch = output.match(/localhost:(\d+)/i)
      if (localhostMatch && actualPort === 0) {
        actualPort = parseInt(localhostMatch[1], 10)
        console.log(`[Electron] Detected server port from localhost: ${actualPort}`)
        resolve(actualPort)
      }
    })

    serverProcess.stderr?.on('data', (data) => {
      const output = data.toString()
      console.error(`[Server stderr] ${output.trim()}`)

      // 也尝试从 stderr 解析端口
      const portMatch = output.match(/\[SERVER_PORT\](\d+)\[\/SERVER_PORT\]/)
      if (portMatch && actualPort === 0) {
        actualPort = parseInt(portMatch[1], 10)
        console.log(`[Electron] Detected server port from stderr: ${actualPort}`)
        resolve(actualPort)
      }

      // 也尝试解析 localhost:端口 格式
      const localhostMatch = output.match(/localhost:(\d+)/i)
      if (localhostMatch && actualPort === 0) {
        actualPort = parseInt(localhostMatch[1], 10)
        console.log(`[Electron] Detected server port from stderr localhost: ${actualPort}`)
        resolve(actualPort)
      }
    })

    serverProcess.on('error', (err) => {
      console.error('[Server] Failed to start:', err)
      reject(err)
    })

    serverProcess.on('close', (code) => {
      console.log(`[Server] Process exited with code ${code}`)
      serverProcess = null
      actualPort = 0
    })

    // 超时处理
    setTimeout(() => {
      if (actualPort === 0) {
        reject(new Error('Server start timeout'))
      }
    }, 30000)
  })
}

/**
 * 停止后端服务
 */
export async function stopServer(): Promise<void> {
  if (serverProcess) {
    return new Promise((resolve) => {
      serverProcess!.on('close', () => {
        serverProcess = null
        actualPort = 0
        resolve()
      })
      serverProcess!.kill('SIGTERM')

      // 强制退出
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL')
        }
      }, 5000)
    })
  }
}
