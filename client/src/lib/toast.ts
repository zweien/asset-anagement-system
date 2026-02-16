import { toast } from 'sonner'

/**
 * Toast 工具函数
 * 封装 sonner 的 toast 方法，提供统一的调用接口
 */

// 成功提示
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
  })
}

// 错误提示
export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
  })
}

// 警告提示
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
  })
}

// 信息提示
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
  })
}

// 加载提示（带 Promise）
export const showLoading = <T>(
  message: string,
  promise: Promise<T>,
  successMessage?: string,
  errorMessage?: string
) => {
  return toast.promise(promise, {
    loading: message,
    success: successMessage || '操作成功',
    error: errorMessage || '操作失败',
  })
}

// 自定义持续时间
export const showWithDuration = (
  message: string,
  duration: number,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  toast[type](message, { duration })
}

// 持久显示（直到手动关闭）
export const showPersistent = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  toast[type](message, { duration: Infinity })
}

// 关闭所有 Toast
export const dismissAll = () => {
  toast.dismiss()
}

// 导出原始 toast 供高级使用
export { toast }
