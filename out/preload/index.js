"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 获取 API 端口
  getPort: () => electron.ipcRenderer.invoke("get-port"),
  // 获取用户数据路径
  getUserDataPath: () => electron.ipcRenderer.invoke("get-user-data-path"),
  // 选择目录
  selectDirectory: () => electron.ipcRenderer.invoke("select-directory"),
  // 选择文件
  selectFile: (filters) => electron.ipcRenderer.invoke("select-file", filters),
  // 退出应用
  quitApp: () => electron.ipcRenderer.invoke("quit-app"),
  // 平台信息
  platform: process.platform,
  // 是否为 Electron 环境
  isElectron: true
});
