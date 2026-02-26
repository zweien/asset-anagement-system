// electron/main/paths.ts
import { app } from 'electron'
import path from 'path'

// 判断是否为开发环境
export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

/**
 * 获取用户数据目录
 * 开发环境: 项目根目录
 * 生产环境: Electron userData 目录
 */
export function getUserDataPath(): string {
  if (isDev) {
    return path.resolve(__dirname, '..', '..')
  }
  return app.getPath('userData')
}

/**
 * 获取数据库文件路径
 */
export function getDatabasePath(): string {
  return path.join(getUserDataPath(), 'data', 'assets.db')
}

/**
 * 获取数据库连接 URL
 */
export function getDatabaseUrl(): string {
  return `file:${getDatabasePath()}`
}

/**
 * 获取上传目录路径
 */
export function getUploadDir(): string {
  return path.join(getUserDataPath(), 'uploads')
}

/**
 * 获取日志目录路径
 */
export function getLogDir(): string {
  return path.join(getUserDataPath(), 'logs')
}

/**
 * 获取前端资源路径
 * 开发环境: Vite 开发服务器
 * 生产环境: electron-vite 构建的 renderer 输出
 */
export function getFrontendPath(): string {
  if (isDev) {
    return 'http://localhost:5173'
  }
  // electron-vite 将前端构建到 out/renderer 目录
  return path.resolve(__dirname, '..', 'renderer')
}

/**
 * 获取后端编译产物路径
 * 生产环境: server 代码在 resources/server/dist（不打包进 asar）
 */
export function getServerPath(): string {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'server', 'dist', 'index.js')
  }
  // 生产环境：从 resources 目录读取（extraResources）
  return path.resolve(process.resourcesPath, 'server', 'dist', 'index.js')
}
