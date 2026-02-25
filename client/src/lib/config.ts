// API 配置 - 支持局域网访问和反向代理
// 优先使用环境变量，否则根据环境自动检测

function getApiBaseUrl(): string {
  // 1. 优先使用环境变量（用于生产环境或自定义配置）
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 2. 生产环境（通过反向代理）：使用当前页面的 origin
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`
  }

  // 3. 开发环境：使用当前页面的 hostname + 3002 端口
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002/api`
}

function getApiBase(): string {
  // 返回不带 /api 后缀的基础地址
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  }

  // 生产环境：使用当前页面的 origin
  if (import.meta.env.PROD) {
    return window.location.origin
  }

  // 开发环境
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002`
}

export const API_BASE_URL = getApiBaseUrl()
export const API_BASE = getApiBase()
