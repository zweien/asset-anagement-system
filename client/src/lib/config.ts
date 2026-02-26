// API 配置 - 支持局域网访问、反向代理和 Electron 环境
// 优先使用环境变量，否则根据环境自动检测

let cachedApiUrl: string | null = null
let cachedApiBase: string | null = null

/**
 * 获取 API 基础 URL（异步版本，支持 Electron）
 */
export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl !== null) {
    return cachedApiUrl
  }

  // 1. 优先使用环境变量（用于生产环境或自定义配置）
  if (import.meta.env.VITE_API_BASE_URL) {
    cachedApiUrl = import.meta.env.VITE_API_BASE_URL as string
    return cachedApiUrl
  }

  // 2. Electron 环境：从主进程获取端口
  if (window.electronAPI?.isElectron) {
    const port = await window.electronAPI.getPort()
    cachedApiUrl = `http://localhost:${port}/api`
    return cachedApiUrl
  }

  // 3. 生产环境（通过反向代理）：使用当前页面的 origin
  if (import.meta.env.PROD) {
    cachedApiUrl = `${window.location.origin}/api`
    return cachedApiUrl
  }

  // 4. 开发环境：使用当前页面的 hostname + 3002 端口
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  cachedApiUrl = `${protocol}//${hostname}:3002/api`
  return cachedApiUrl
}

/**
 * 获取 API 基础地址（异步版本，支持 Electron）
 */
export async function getApiBase(): Promise<string> {
  if (cachedApiBase !== null) {
    return cachedApiBase
  }

  const apiUrl = await getApiBaseUrl()
  cachedApiBase = apiUrl.replace(/\/api$/, '')
  return cachedApiBase
}

/**
 * 同步获取 API 基础 URL（用于兼容现有代码）
 * 注意：在 Electron 环境中首次调用可能返回空字符串
 */
function getApiBaseUrlSync(): string {
  // 1. 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 2. Electron 环境：返回空，需要使用异步版本
  if (window.electronAPI?.isElectron) {
    return ''
  }

  // 3. 生产环境
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`
  }

  // 4. 开发环境
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002/api`
}

function getApiBaseSync(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  }

  if (window.electronAPI?.isElectron) {
    return ''
  }

  if (import.meta.env.PROD) {
    return window.location.origin
  }

  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002`
}

// 导出同步版本（兼容现有代码）
export const API_BASE_URL = getApiBaseUrlSync()
export const API_BASE = getApiBaseSync()
