"use strict";
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
const promises = require("fs/promises");
const fs = require("fs");
const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
function getUserDataPath() {
  if (isDev) {
    return path.resolve(__dirname, "..", "..");
  }
  return electron.app.getPath("userData");
}
function getDatabasePath() {
  return path.join(getUserDataPath(), "data", "assets.db");
}
function getDatabaseUrl() {
  return `file:${getDatabasePath()}`;
}
function getUploadDir() {
  return path.join(getUserDataPath(), "uploads");
}
function getLogDir() {
  return path.join(getUserDataPath(), "logs");
}
function getFrontendPath() {
  if (isDev) {
    return "http://localhost:5173";
  }
  return path.resolve(__dirname, "..", "..", "client", "dist");
}
function getServerPath() {
  if (isDev) {
    return path.resolve(__dirname, "..", "..", "server", "dist", "index.js");
  }
  return path.resolve(process.resourcesPath, "server", "index.js");
}
let serverProcess = null;
let actualPort = 0;
function getActualPort() {
  return actualPort;
}
async function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath();
    const env = {
      ...process.env,
      DATABASE_URL: getDatabaseUrl(),
      UPLOAD_DIR: getUploadDir(),
      LOG_DIR: getLogDir(),
      NODE_ENV: isDev ? "development" : "production",
      ELECTRON_MODE: "true"
    };
    const portToUse = isDev ? "0" : "3002";
    const projectRoot = isDev ? path.resolve(__dirname, "..", "..") : path.resolve(process.resourcesPath, "..");
    serverProcess = child_process.spawn("node", [serverPath], {
      env: { ...env, PORT: portToUse },
      stdio: ["pipe", "pipe", "pipe"],
      cwd: projectRoot
      // 使用项目根目录作为工作目录
    });
    serverProcess.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log(`[Server stdout] ${output.trim()}`);
      const portMatch = output.match(/(?:port|localhost:)(\d+)/i);
      if (portMatch && actualPort === 0) {
        actualPort = parseInt(portMatch[1], 10);
        console.log(`[Electron] Detected server port: ${actualPort}`);
        resolve(actualPort);
      }
    });
    serverProcess.stderr?.on("data", (data) => {
      const output = data.toString();
      console.error(`[Server stderr] ${output.trim()}`);
      const portMatch = output.match(/(?:port|localhost:)(\d+)/i);
      if (portMatch && actualPort === 0) {
        actualPort = parseInt(portMatch[1], 10);
        console.log(`[Electron] Detected server port from stderr: ${actualPort}`);
        resolve(actualPort);
      }
    });
    serverProcess.on("error", (err) => {
      console.error("[Server] Failed to start:", err);
      reject(err);
    });
    serverProcess.on("close", (code) => {
      console.log(`[Server] Process exited with code ${code}`);
      serverProcess = null;
      actualPort = 0;
    });
    setTimeout(() => {
      if (actualPort === 0) {
        reject(new Error("Server start timeout"));
      }
    }, 3e4);
  });
}
async function stopServer() {
  if (serverProcess) {
    return new Promise((resolve) => {
      serverProcess.on("close", () => {
        serverProcess = null;
        actualPort = 0;
        resolve();
      });
      serverProcess.kill("SIGTERM");
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill("SIGKILL");
        }
      }, 5e3);
    });
  }
}
let mainWindow = null;
function getMainWindow() {
  return mainWindow;
}
async function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "资产管理系统",
    show: false,
    // 先隐藏，加载完成后显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "..", "preload", "index.js")
    },
    autoHideMenuBar: !isDev
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  if (isDev) {
    await mainWindow.loadURL(getFrontendPath());
    mainWindow.webContents.openDevTools();
  } else {
    const frontendPath = getFrontendPath();
    await mainWindow.loadFile(path.join(frontendPath, "index.html"));
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  return mainWindow;
}
async function ensureDirectories() {
  const dirs = [
    path.dirname(getDatabasePath()),
    getUploadDir(),
    getLogDir()
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      await promises.mkdir(dir, { recursive: true });
    }
  }
}
function setupIpcHandlers() {
  electron.ipcMain.handle("get-port", () => getActualPort());
  electron.ipcMain.handle("get-user-data-path", () => getUserDataPath());
  electron.ipcMain.handle("select-directory", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    return result.filePaths[0] || null;
  });
  electron.ipcMain.handle("select-file", async (_event, filters) => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: filters || [{ name: "All Files", extensions: ["*"] }]
    });
    return result.filePaths[0] || null;
  });
  electron.ipcMain.handle("quit-app", () => {
    electron.app.quit();
  });
}
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
}
electron.app.on("second-instance", () => {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
electron.app.whenReady().then(async () => {
  try {
    console.log("[Electron] Starting application...");
    await ensureDirectories();
    console.log("[Electron] Directories ensured");
    setupIpcHandlers();
    console.log("[Electron] IPC handlers setup");
    const port = await startServer();
    console.log(`[Electron] Backend started on port ${port}`);
    await createWindow();
    console.log("[Electron] Window created");
    console.log("[Electron] Application ready");
  } catch (error) {
    console.error("[Electron] Failed to start:", error);
    electron.app.quit();
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", async () => {
  console.log("[Electron] Shutting down...");
  await stopServer();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
