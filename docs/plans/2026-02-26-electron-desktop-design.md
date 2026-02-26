# Electron 桌面应用设计方案

> 创建日期: 2026-02-26
> 状态: 已批准

## 概述

将资产管理系统 Web 应用转换为 Electron 跨平台桌面应用，支持 Windows、macOS、Linux 三平台。

## 需求决策

| 需求项 | 决策 |
|--------|------|
| 目标平台 | Windows + macOS + Linux |
| 数据存储 | 应用数据目录 (userData) |
| 后端集成 | 内嵌模式 (主进程) |
| 构建工具 | electron-vite |
| 自动更新 | 需要 (electron-updater + GitHub Releases) |
| 开发流程 | 独立前缀 `electron:`，不影响现有 Web 开发流程 |

## 目录结构

```
demo-ehlra/
├── electron/                      # Electron 专用代码（新增）
│   ├── main/                      # 主进程
│   │   ├── index.ts              # 主进程入口
│   │   ├── paths.ts              # 路径工具（数据目录等）
│   │   ├── server.ts             # Express 服务管理
│   │   └── window.ts             # 窗口管理
│   ├── preload/                   # 预加载脚本
│   │   └── index.ts              # 暴露 API 给渲染进程
│   └── resources/                 # 打包资源
│       ├── icon.ico              # Windows 图标
│       ├── icon.icns             # macOS 图标
│       └── icon.png              # Linux 图标
├── client/                        # 前端（保持不变）
├── server/                        # 后端（保持不变）
├── electron.vite.config.ts       # Electron Vite 配置（新增）
├── electron-builder.yml          # 打包配置（新增）
└── package.json                   # 根配置（更新）
```

## 主进程架构

```
┌─────────────────────────────────────────────────────────┐
│                 Electron 主进程                          │
├─────────────────────────────────────────────────────────┤
│  1. 启动时                                              │
│     ├── 确保数据目录存在 (userData/data, uploads)        │
│     ├── 启动 Express 后端 (随机端口)                     │
│     └── 创建浏览器窗口                                   │
│                                                         │
│  2. 运行时                                              │
│     ├── 窗口加载前端页面                                 │
│     ├── 前端通过 IPC 获取实际 API 端口                   │
│     └── Express 处理 API 请求                           │
│                                                         │
│  3. 退出时                                              │
│     └── 优雅关闭 Express 服务                           │
└─────────────────────────────────────────────────────────┘
```

### 关键技术点

| 问题 | 解决方案 |
|------|----------|
| 端口冲突 | 后端使用端口 `0`，由系统自动分配空闲端口 |
| 数据路径 | 通过 `app.getPath('userData')` 获取用户数据目录 |
| 前端获取端口 | 预加载脚本暴露 `electronAPI.getPort()` |

## 前端适配

**改动最小化**，只需修改 API 配置文件：

### `client/src/lib/config.ts` 改动

```typescript
// 新增：检测 Electron 环境
async function getApiBaseUrl(): Promise<string> {
  // 1. Electron 环境：从主进程获取端口
  if (window.electronAPI?.isElectron) {
    const port = await window.electronAPI.getPort()
    return `http://localhost:${port}/api`
  }

  // 2. Web 环境：保持原有逻辑
  return import.meta.env.VITE_API_BASE_URL || `${origin}/api`
}
```

### 类型声明（新增 `client/src/types/electron.d.ts`）

```typescript
declare global {
  interface Window {
    electronAPI?: {
      isElectron: true
      getPort: () => Promise<number>
    }
  }
}
```

**改动文件**: 仅 `client/src/lib/config.ts` + 新增类型声明

## 后端适配

**改动目标**: 让 Express 服务支持 Electron 主进程调用。

### `server/src/index.ts` 改动

```typescript
// 当前：直接启动服务
app.listen(PORT, () => { ... })

// 改为：导出启动函数，支持动态端口
export async function startServer(port?: number): Promise<number> {
  const PORT = port ?? parseInt(process.env.PORT || '3002')
  return new Promise((resolve) => {
    const server = app.listen(PORT, async () => {
      await AuthService.createDefaultAdmin()
      resolve(PORT)
    })
  })
}

// 仅在直接运行时自动启动（Electron 环境不执行）
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
```

### 数据目录适配

| 环境变量 | Web 环境 | Electron 环境 |
|---------|---------|--------------|
| `DATABASE_URL` | `file:../data/assets.db` | `file:{userData}/data/assets.db` |
| `UPLOAD_DIR` | `uploads` | `{userData}/uploads` |

**改动文件**: 仅 `server/src/index.ts`

## 打包配置

### electron-builder.yml 核心配置

```yaml
appId: com.asset-management.app
productName: 资产管理系统

files:
  - "electron/dist/**/*"      # Electron 主进程
  - "client/dist/**/*"         # 前端构建产物
  - "server/dist/**/*"         # 后端编译产物
  - "server/prisma/**/*"       # Prisma schema

extraResources:
  - from: "server/node_modules/.prisma"
    to: "server/node_modules/.prisma"

# 平台配置
win:
  target: nsis                 # Windows 安装包
mac:
  target: dmg                  # macOS 安装包
linux:
  target: [AppImage, deb]      # Linux 多格式

# 自动更新
publish:
  provider: github             # 从 GitHub Releases 更新
```

**构建产物大小估算**: ~150-200MB（含 Node.js 运行时）

## 开发命令

### 根 package.json 脚本（独立前缀）

```json
{
  "scripts": {
    "electron:dev": "electron-vite dev",
    "electron:build": "electron-vite build",
    "electron:package": "electron-builder",
    "electron:package:win": "electron-builder --win",
    "electron:package:mac": "electron-builder --mac",
    "electron:package:linux": "electron-builder --linux"
  }
}
```

### 开发流程

| 命令 | 说明 |
|------|------|
| `npm run electron:dev` | 启动 Electron 开发模式（热重载） |
| `npm run electron:build` | 构建 Electron 应用 |
| `npm run electron:package` | 打包当前平台安装包 |
| `npm run electron:package:win` | 打包 Windows 安装包 |
| `npm run electron:package:mac` | 打包 macOS 安装包 |
| `npm run electron:package:linux` | 打包 Linux 安装包 |

### 新增依赖

```bash
npm install electron electron-builder electron-vite electron-updater --save-dev
```

## 与现有流程兼容性

| 现有流程 | Electron 流程 | 冲突？ |
|---------|--------------|--------|
| `./init.sh server` | `npm run electron:dev` | ✅ 无冲突 |
| `./init.sh client` | `npm run electron:dev` | ✅ 无冲突 |
| Docker 部署 | Electron 打包 | ✅ 无冲突 |

**原则**: Electron 使用独立命令前缀 `electron:`，现有 Web 开发流程 (`init.sh`) 完全不受影响。

## 数据目录位置

应用数据存储在用户数据目录：

| 平台 | 路径 |
|------|------|
| Windows | `%APPDATA%\asset-management-desktop\` |
| macOS | `~/Library/Application Support/asset-management-desktop/` |
| Linux | `~/.config/asset-management-desktop/` |
