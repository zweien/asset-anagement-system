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
    }

    // 使用端口 0 让系统自动分配
    serverProcess = spawn('node', [serverPath], {
      env: { ...env, PORT: '0' },
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(serverPath),
    })

    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`[Server] ${output}`)

      // 解析端口号
      const portMatch = output.match(/running on port (\d+)/i)
      if (portMatch) {
        actualPort = parseInt(portMatch[1], 10)
        resolve(actualPort)
      }
    })

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data.toString()}`)
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
