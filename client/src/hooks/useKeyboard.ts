import { useEffect, useCallback } from 'react'

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: () => void
  description?: string
}

// 用于显示的快捷键信息（不需要 handler）
export interface ShortcutDisplay {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  description: string
}

export function useKeyboard(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 忽略在输入框、文本域等元素中的按键
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.tagName === 'SELECT' ||
                           target.isContentEditable

      // 对于非控制键组合，在输入框中不触发快捷键
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey
      if (isInputField && !hasModifier) {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault()
          shortcut.handler()
          return
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// 快捷键列表（用于显示帮助）
export const SHORTCUTS: ShortcutDisplay[] = [
  { key: 'k', ctrl: true, description: '全局搜索' },
  { key: 'n', ctrl: true, description: '新增资产' },
  { key: 's', ctrl: true, description: '保存表单' },
  { key: 'Escape', description: '关闭弹窗' },
  { key: '/', shift: true, description: '显示快捷键帮助' },
]
