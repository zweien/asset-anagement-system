// API 配置 - 支持局域网访问
// 优先使用环境变量，否则使用当前页面的 hostname

function getApiBaseUrl(): string {
  // 1. 优先使用环境变量（用于生产环境或自定义配置）
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 2. 开发环境：使用当前页面的 hostname
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002/api`
}

function getApiBase(): string {
  // 返回不带 /api 后缀的基础地址
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  }
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3002`
}

export const API_BASE_URL = getApiBaseUrl()
export const API_BASE = getApiBase()
