// electron/main/window.ts
import { BrowserWindow, shell } from 'electron'
import path from 'path'
import { isDev, getFrontendPath } from './paths'
import { getActualPort } from './server'

let mainWindow: BrowserWindow | null = null

/**
 * 获取主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * 创建主窗口
 */
export async function createWindow(): Promise<BrowserWindow> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: '资产管理系统',
    show: false, // 先隐藏，加载完成后显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
    },
    autoHideMenuBar: !isDev,
  })

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 加载前端页面
  if (isDev) {
    await mainWindow.loadURL(getFrontendPath())
    mainWindow.webContents.openDevTools()
  } else {
    const frontendPath = getFrontendPath()
    await mainWindow.loadFile(path.join(frontendPath, 'index.html'))
    // 生产环境也打开开发者工具用于调试（正式发布时可移除）
    mainWindow.webContents.openDevTools()
  }

  // 外部链接用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

/**
 * 获取 API 基础 URL
 */
export function getApiBaseUrl(): string {
  const port = getActualPort()
  return `http://localhost:${port}/api`
}
