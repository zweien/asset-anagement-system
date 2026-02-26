// electron/main/index.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createWindow, getMainWindow } from './window'
import { startServer, stopServer, getActualPort } from './server'
import { getUserDataPath, getDatabasePath, getUploadDir, getLogDir, isDev } from './paths'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

// 禁用硬件加速（修复 WSL/Linux 环境下的鼠标和渲染问题）
app.disableHardwareAcceleration()
// 禁用 GPU 沙箱
app.commandLine.appendSwitch('disable-gpu-sandbox')
// 禁用 GPU
app.commandLine.appendSwitch('disable-gpu')
// 禁用软件光栅化
app.commandLine.appendSwitch('disable-software-rasterizer')

/**
 * 确保必要目录存在
 */
async function ensureDirectories(): Promise<void> {
  const dirs = [
    path.dirname(getDatabasePath()),
    getUploadDir(),
    getLogDir(),
  ]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}

/**
 * 初始化数据库（运行 Prisma db push）
 */
async function initializeDatabase(): Promise<void> {
  const dbPath = getDatabasePath()

  // 如果数据库文件不存在，需要初始化
  if (!existsSync(dbPath)) {
    console.log('[Electron] Initializing database...')

    // 获取 Prisma CLI 路径
    const resourcesPath = isDev
      ? path.resolve(__dirname, '..', '..')
      : process.resourcesPath
    const prismaPath = path.join(resourcesPath, 'server', 'node_modules', '.bin', 'prisma')
    const schemaPath = path.join(resourcesPath, 'server', 'prisma', 'schema.prisma')

    try {
      // 运行 prisma db push
      execSync(`node "${prismaPath}" db push --skip-generate`, {
        cwd: path.join(resourcesPath, 'server'),
        env: {
          ...process.env,
          DATABASE_URL: `file:${dbPath}`,
        },
        stdio: 'inherit',
      })
      console.log('[Electron] Database initialized')
    } catch (error) {
      console.error('[Electron] Failed to initialize database:', error)
      throw error
    }
  }
}

/**
 * 设置 IPC 处理器
 */
function setupIpcHandlers(): void {
  // 获取 API 端口
  ipcMain.handle('get-port', () => getActualPort())

  // 获取用户数据路径
  ipcMain.handle('get-user-data-path', () => getUserDataPath())

  // 选择目录
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    return result.filePaths[0] || null
  })

  // 选择文件
  ipcMain.handle('select-file', async (_event, filters) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    })
    return result.filePaths[0] || null
  })

  // 退出应用
  ipcMain.handle('quit-app', () => {
    app.quit()
  })
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', () => {
  const win = getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(async () => {
  try {
    console.log('[Electron] Starting application...')

    // 1. 确保目录存在
    await ensureDirectories()
    console.log('[Electron] Directories ensured')

    // 2. 初始化数据库
    await initializeDatabase()
    console.log('[Electron] Database ready')

    // 3. 设置 IPC 处理器
    setupIpcHandlers()
    console.log('[Electron] IPC handlers setup')

    // 4. 启动后端服务
    const port = await startServer()
    console.log(`[Electron] Backend started on port ${port}`)

    // 5. 创建窗口
    await createWindow()
    console.log('[Electron] Window created')

    console.log('[Electron] Application ready')
  } catch (error) {
    console.error('[Electron] Failed to start:', error)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  console.log('[Electron] Shutting down...')
  await stopServer()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
