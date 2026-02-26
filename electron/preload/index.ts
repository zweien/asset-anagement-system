// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露安全的 API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取 API 端口
  getPort: () => ipcRenderer.invoke('get-port'),

  // 获取用户数据路径
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // 选择目录
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // 选择文件
  selectFile: (filters?: Array<{ name: string; extensions: string[] }>) =>
    ipcRenderer.invoke('select-file', filters),

  // 退出应用
  quitApp: () => ipcRenderer.invoke('quit-app'),

  // 平台信息
  platform: process.platform,

  // 是否为 Electron 环境
  isElectron: true,
})
