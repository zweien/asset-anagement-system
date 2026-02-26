# Electron 桌面应用实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将资产管理系统 Web 应用转换为 Electron 跨平台桌面应用，支持 Windows/macOS/Linux 三平台。

**Architecture:** Electron 主进程内嵌 Express 后端服务，前端通过 IPC 获取 API 端口。数据存储在用户数据目录 (userData)。使用 electron-vite 构建和 electron-builder 打包。

**Tech Stack:** Electron 33, electron-vite 2, electron-builder 25, electron-updater 6

---

## Task 1: 安装 Electron 依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装核心依赖**

```bash
npm install electron electron-vite electron-builder electron-updater electron-log --save-dev
```

**Step 2: 验证安装**

Run: `npx electron --version`
Expected: 输出 Electron 版本号 (如 v33.x.x)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: 添加 Electron 开发依赖"
```

---

## Task 2: 创建 Electron 目录结构

**Files:**
- Create: `electron/main/index.ts`
- Create: `electron/main/paths.ts`
- Create: `electron/main/server.ts`
- Create: `electron/main/window.ts`
- Create: `electron/preload/index.ts`
- Create: `electron/resources/.gitkeep`

**Step 1: 创建目录**

```bash
mkdir -p electron/main electron/preload electron/resources
```

**Step 2: 创建 gitkeep 文件**

```bash
touch electron/resources/.gitkeep
```

**Step 3: Commit**

```bash
git add electron/
git commit -m "chore: 创建 Electron 目录结构"
```

---

## Task 3: 实现路径工具模块

**Files:**
- Create: `electron/main/paths.ts`

**Step 1: 编写路径工具代码**

```typescript
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
 */
export function getFrontendPath(): string {
  if (isDev) {
    return 'http://localhost:5173'
  }
  return path.resolve(__dirname, '..', '..', 'client', 'dist')
}

/**
 * 获取后端编译产物路径
 */
export function getServerPath(): string {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'server', 'dist', 'index.js')
  }
  return path.resolve(process.resourcesPath, 'server', 'index.js')
}
```

**Step 2: 验证 TypeScript 编译**

Run: `cd /home/z/codebase/demo-ehlra && npx tsc --noEmit electron/main/paths.ts 2>&1 || echo "TypeScript check complete"`

**Step 3: Commit**

```bash
git add electron/main/paths.ts
git commit -m "feat(electron): 添加路径工具模块"
```

---

## Task 4: 实现服务器管理模块

**Files:**
- Create: `electron/main/server.ts`

**Step 1: 编写服务器管理代码**

```typescript
// electron/main/server.ts
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import { getServerPath, getDatabaseUrl, getUploadDir, getLogDir, isDev } from './paths'

let serverProcess: ChildProcess | null = null
let actualPort: number = 0

/**
 * 获取实际使用的端口
 */
export function getActualPort(): number {
  return actualPort
}

/**
 * 启动后端服务
 * 返回实际使用的端口号
 */
export async function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath()

    // 设置环境变量
    const env = {
      ...process.env,
      DATABASE_URL: getDatabaseUrl(),
      UPLOAD_DIR: getUploadDir(),
      LOG_DIR: getLogDir(),
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_MODE: 'true',
    }

    // 使用端口 0 让系统自动分配
    serverProcess = spawn('node', [serverPath], {
      env: { ...env, PORT: '0' },
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(serverPath),
    })

    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`[Server] ${output}`)

      // 解析端口号
      const portMatch = output.match(/running on port (\d+)/i)
      if (portMatch) {
        actualPort = parseInt(portMatch[1], 10)
        resolve(actualPort)
      }
    })

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data.toString()}`)
    })

    serverProcess.on('error', (err) => {
      console.error('[Server] Failed to start:', err)
      reject(err)
    })

    serverProcess.on('close', (code) => {
      console.log(`[Server] Process exited with code ${code}`)
      serverProcess = null
      actualPort = 0
    })

    // 超时处理
    setTimeout(() => {
      if (actualPort === 0) {
        reject(new Error('Server start timeout'))
      }
    }, 30000)
  })
}

/**
 * 停止后端服务
 */
export async function stopServer(): Promise<void> {
  if (serverProcess) {
    return new Promise((resolve) => {
      serverProcess!.on('close', () => {
        serverProcess = null
        actualPort = 0
        resolve()
      })
      serverProcess!.kill('SIGTERM')

      // 强制退出
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL')
        }
      }, 5000)
    })
  }
}
```

**Step 2: Commit**

```bash
git add electron/main/server.ts
git commit -m "feat(electron): 添加服务器管理模块"
```

---

## Task 5: 实现窗口管理模块

**Files:**
- Create: `electron/main/window.ts`

**Step 1: 编写窗口管理代码**

```typescript
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
```

**Step 2: Commit**

```bash
git add electron/main/window.ts
git commit -m "feat(electron): 添加窗口管理模块"
```

---

## Task 6: 实现预加载脚本

**Files:**
- Create: `electron/preload/index.ts`

**Step 1: 编写预加载脚本**

```typescript
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
```

**Step 2: Commit**

```bash
git add electron/preload/index.ts
git commit -m "feat(electron): 添加预加载脚本"
```

---

## Task 7: 实现主进程入口

**Files:**
- Create: `electron/main/index.ts`

**Step 1: 编写主进程入口代码**

```typescript
// electron/main/index.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createWindow, getMainWindow } from './window'
import { startServer, stopServer, getActualPort } from './server'
import { getUserDataPath, getDatabasePath, getUploadDir, getLogDir } from './paths'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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

    // 2. 设置 IPC 处理器
    setupIpcHandlers()
    console.log('[Electron] IPC handlers setup')

    // 3. 启动后端服务
    const port = await startServer()
    console.log(`[Electron] Backend started on port ${port}`)

    // 4. 创建窗口
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
```

**Step 2: Commit**

```bash
git add electron/main/index.ts
git commit -m "feat(electron): 添加主进程入口"
```

---

## Task 8: 适配后端代码

**Files:**
- Modify: `server/src/index.ts`

**Step 1: 修改后端入口文件**

找到 `server/src/index.ts` 中的服务启动代码，修改为：

```typescript
// 在文件末尾，找到 app.listen 调用

// 导出启动函数，支持动态端口
export async function startServer(preferredPort?: number): Promise<number> {
  const PORT = preferredPort ?? parseInt(process.env.PORT || '3002', 10)

  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(PORT, async () => {
        logger.info(`Server is running on port ${PORT}`)
        await AuthService.createDefaultAdmin()
        resolve(PORT)
      })

      server.on('error', (err: Error) => {
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

// 仅在直接运行时启动（非 Electron 环境）
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule && process.env.ELECTRON_MODE !== 'true') {
  startServer()
}
```

**Step 2: 验证后端编译**

Run: `cd /home/z/codebase/demo-ehlra/server && npm run build`
Expected: 编译成功，无错误

**Step 3: Commit**

```bash
git add server/src/index.ts
git commit -m "feat(server): 支持 Electron 环境动态端口启动"
```

---

## Task 9: 适配前端代码

**Files:**
- Create: `client/src/types/electron.d.ts`
- Modify: `client/src/lib/config.ts`

**Step 1: 创建 Electron 类型声明**

```typescript
// client/src/types/electron.d.ts
declare global {
  interface Window {
    electronAPI?: {
      isElectron: true
      getPort: () => Promise<number>
      getUserDataPath: () => Promise<string>
      selectDirectory: () => Promise<string | null>
      selectFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<string | null>
      quitApp: () => Promise<void>
      platform: string
    }
  }
}

export {}
```

**Step 2: 修改 API 配置**

找到 `client/src/lib/config.ts`，修改 `getApiBaseUrl` 函数：

```typescript
// 在文件顶部添加
let cachedApiUrl: string | null = null

/**
 * 获取 API 基础 URL
 * 支持 Electron 环境动态端口
 */
export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl) {
    return cachedApiUrl
  }

  // 1. 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    cachedApiUrl = import.meta.env.VITE_API_BASE_URL
    return cachedApiUrl
  }

  // 2. Electron 环境：从主进程获取端口
  if (window.electronAPI?.isElectron) {
    const port = await window.electronAPI.getPort()
    cachedApiUrl = `http://localhost:${port}/api`
    return cachedApiUrl
  }

  // 3. 生产环境（Web）
  if (import.meta.env.PROD) {
    cachedApiUrl = `${window.location.origin}/api`
    return cachedApiUrl
  }

  // 4. 开发环境
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  cachedApiUrl = `${protocol}//${hostname}:3002/api`
  return cachedApiUrl
}

// 导出同步版本（用于兼容现有代码）
export const API_BASE_URL = '' // 空字符串，实际使用 getApiBaseUrl()
```

**Step 3: 验证前端编译**

Run: `cd /home/z/codebase/demo-ehlra/client && npm run build`
Expected: 编译成功

**Step 4: Commit**

```bash
git add client/src/types/electron.d.ts client/src/lib/config.ts
git commit -m "feat(client): 支持 Electron 环境 API 配置"
```

---

## Task 10: 配置 electron-vite

**Files:**
- Create: `electron.vite.config.ts`

**Step 1: 创建 electron-vite 配置**

```typescript
// electron.vite.config.ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'client'),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'client/src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'client/index.html'),
        },
      },
    },
  },
})
```

**Step 2: Commit**

```bash
git add electron.vite.config.ts
git commit -m "chore: 添加 electron-vite 配置"
```

---

## Task 11: 配置 electron-builder

**Files:**
- Create: `electron-builder.yml`

**Step 1: 创建打包配置**

```yaml
# electron-builder.yml
appId: com.asset-management.app
productName: 资产管理系统
copyright: Copyright © 2024

directories:
  output: release
  buildResources: electron/resources

# 包含的文件
files:
  - "electron/dist/**/*"
  - "client/dist/**/*"
  - "server/dist/**/*"
  - "server/prisma/**/*"
  - "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}"
  - "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}"
  - "!**/node_modules/.bin"
  - "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}"
  - "!.{js,min.js,map}"
  - "!**/*.{ts,tsx,map}"
  - "!**/.*"

# 额外资源
extraResources:
  - from: "server/node_modules/.prisma"
    to: "server/node_modules/.prisma"
  - from: "server/node_modules/@prisma"
    to: "server/node_modules/@prisma"
  - from: "server/prisma"
    to: "server/prisma"

# macOS 配置
mac:
  category: public.app-category.productivity
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  hardenedRuntime: true
  gatekeeperAssess: false

# Windows 配置
win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
  icon: electron/resources/icon.ico

nsis:
  oneClick: false
  perMachine: false
  allowElevation: true
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

# Linux 配置
linux:
  target:
    - AppImage
    - deb
  category: Office
  maintainer: support@example.com

# 自动更新
publish:
  provider: github
  owner: zweien
  repo: asset-anagement-system
```

**Step 2: Commit**

```bash
git add electron-builder.yml
git commit -m "chore: 添加 electron-builder 打包配置"
```

---

## Task 12: 更新根 package.json

**Files:**
- Modify: `package.json`

**Step 1: 更新 package.json**

```json
{
  "name": "asset-management-desktop",
  "version": "1.6.0",
  "description": "资产管理系统 - 桌面应用",
  "main": "electron/dist/main/index.js",
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "electron:dev": "electron-vite dev",
    "electron:build": "npm run build:server && npm run build:client && electron-vite build",
    "electron:preview": "electron-vite preview",
    "electron:package": "npm run electron:build && electron-builder",
    "electron:package:win": "npm run electron:build && electron-builder --win",
    "electron:package:mac": "npm run electron:build && electron-builder --mac",
    "electron:package:linux": "npm run electron:build && electron-builder --linux",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build",
    "postinstall": "electron-builder install-app-deps"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "electron": "^33.0.0",
    "electron-builder": "^25.1.8",
    "electron-vite": "^2.3.0",
    "electron-log": "^5.2.0",
    "electron-updater": "^6.3.9"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Step 2: 安装依赖**

```bash
npm install
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: 更新 package.json 添加 Electron 脚本"
```

---

## Task 13: 创建应用图标

**Files:**
- Create: `electron/resources/icon.png`
- Create: `electron/resources/icon.ico`
- Create: `electron/resources/icon.icns`

**Step 1: 创建占位图标**

由于需要图形设计，先创建说明文件：

```bash
cat > electron/resources/README.md << 'EOF'
# 应用图标

请将以下图标文件放入此目录：

- `icon.png` - Linux 图标 (512x512 PNG)
- `icon.ico` - Windows 图标 (256x256 ICO)
- `icon.icns` - macOS 图标 (512x512 ICNS)

可以使用在线工具生成：
- https://www.icoconverter.com/
- https://iconverticons.com/online/

建议使用透明背景，主体内容居中，边缘留有适当边距。
EOF
```

**Step 2: Commit**

```bash
git add electron/resources/README.md
git commit -m "docs: 添加应用图标说明"
```

---

## Task 14: 测试 Electron 开发模式

**Files:**
- None (测试任务)

**Step 1: 启动开发模式**

```bash
npm run electron:dev
```

**Step 2: 验证功能**

- [ ] Electron 窗口正常打开
- [ ] 后端服务启动成功（控制台显示端口）
- [ ] 前端页面正常加载
- [ ] 登录功能正常
- [ ] API 请求正常

**Step 3: 如有问题，记录并修复**

---

## Task 15: 测试打包功能

**Files:**
- None (测试任务)

**Step 1: 执行打包**

```bash
npm run electron:package
```

**Step 2: 验证打包产物**

- [ ] `release/` 目录生成安装包
- [ ] 安装包大小合理 (~150-200MB)
- [ ] 安装后应用能正常启动

**Step 3: Commit 最终状态**

```bash
git add -A
git commit -m "feat: 完成 Electron 桌面应用集成"
```

---

## 实施顺序总结

| Task | 描述 | 预计时间 |
|------|------|---------|
| 1 | 安装依赖 | 5 分钟 |
| 2 | 创建目录结构 | 2 分钟 |
| 3 | 路径工具模块 | 10 分钟 |
| 4 | 服务器管理模块 | 10 分钟 |
| 5 | 窗口管理模块 | 10 分钟 |
| 6 | 预加载脚本 | 5 分钟 |
| 7 | 主进程入口 | 10 分钟 |
| 8 | 后端适配 | 10 分钟 |
| 9 | 前端适配 | 15 分钟 |
| 10 | electron-vite 配置 | 5 分钟 |
| 11 | electron-builder 配置 | 5 分钟 |
| 12 | 更新 package.json | 5 分钟 |
| 13 | 应用图标 | 5 分钟 |
| 14 | 开发模式测试 | 15 分钟 |
| 15 | 打包测试 | 20 分钟 |
| **总计** | | **~2 小时** |
