import { app, BrowserWindow, ipcMain, shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

// 包装 fetch 添加 User-Agent 头，解决代理服务器连接问题
const originalFetch = globalThis.fetch.bind(globalThis)
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const headers = new Headers(init?.headers)
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
  }
  return originalFetch(input, { ...init, headers })
}) as typeof globalThis.fetch
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
  downloadKernel,
  getInstalledKernelVersions,
  getKernelInstallationStatus,
  getKernelReleases,
  revealKernelDirectory
} from './kernel-releases'
import { startLocalServer, stopLocalServer } from './server/app'
import {
  chooseWorkspaceDirectory,
  getWorkspacePaths,
  revealWorkspaceDirectory
} from './workspace-paths'
import { initializeAutoUpdater } from './auto-updater'

let mainWindow: BrowserWindow | null = null

// 镜像加速地址设置
const MIRROR_SETTINGS_KEY = 'mirrorUrl'

function getMirrorSettingsPath(): string {
  return join(app.getPath('userData'), 'mirror-settings.json')
}

const DEFAULT_MIRROR_URL = 'https://v4.gh-proxy.org/'

function loadMirrorUrl(): string {
  const path = getMirrorSettingsPath()
  try {
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf-8')
      const parsed = JSON.parse(raw) as Record<string, string>
      return parsed[MIRROR_SETTINGS_KEY] || ''
    }
  } catch {
    // ignore
  }
  return ''
}

function saveMirrorUrl(url: string): void {
  const path = getMirrorSettingsPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify({ [MIRROR_SETTINGS_KEY]: url }, null, 2), 'utf-8')
  applyMirrorUrl(url)
}

function applyMirrorUrl(url: string): void {
  if (url) {
    // 镜像 URL 是前缀代理，需要拼接完整的 GitHub 下载路径
    // 例如：https://v4.gh-proxy.org/ + https://github.com/.../releases/download/...
    const baseUrl = url.endsWith('/') ? url : url + '/'
    process.env.CLOAKBROWSER_DOWNLOAD_URL = baseUrl + 'https://github.com/CloakHQ/cloakbrowser/releases/download'
    process.env.CLOAKBROWSER_SKIP_CHECKSUM = 'true'
  } else {
    delete process.env.CLOAKBROWSER_DOWNLOAD_URL
    delete process.env.CLOAKBROWSER_SKIP_CHECKSUM
  }
}

function getAppIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'build/icon.png')
}

async function createWindow(): Promise<void> {
  // Initialize workspace (load settings + apply CLOAKBROWSER_CACHE_DIR)
  // BEFORE startLocalServer, so the dynamic cloakbrowser import sees the env var.
  getWorkspacePaths()
  await startLocalServer(app.getPath('userData'))

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'CloakBrowserDesktop',
    icon: getAppIconPath(),
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getWindowFromEvent(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

ipcMain.handle('window:minimize', (event) => {
  getWindowFromEvent(event)?.minimize()
})

ipcMain.handle('window:toggle-maximize', (event) => {
  const window = getWindowFromEvent(event)
  if (!window) return false
  if (window.isMaximized()) {
    window.unmaximize()
    return false
  }
  window.maximize()
  return true
})

ipcMain.handle('window:close', (event) => {
  getWindowFromEvent(event)?.close()
})

ipcMain.handle('window:is-maximized', (event) => {
  return Boolean(getWindowFromEvent(event)?.isMaximized())
})

ipcMain.handle('kernels:list-releases', (_event, force?: boolean) => {
  return getKernelReleases(Boolean(force))
})

ipcMain.handle('kernels:installation-status', () => {
  return getKernelInstallationStatus()
})

ipcMain.handle('kernels:installed-versions', () => {
  return getInstalledKernelVersions()
})

ipcMain.handle(
  'kernels:download',
  (event, payload: { version: string; edition: 'free' | 'pro' }) => {
    if (!payload || typeof payload.version !== 'string') {
      throw new Error('缺少内核版本号')
    }
    return downloadKernel(payload.version, payload.edition, (progress) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('kernels:download-progress', progress)
      }
    })
  }
)

ipcMain.handle(
  'kernels:reveal-version',
  (_event, payload: { version: string; edition: 'free' | 'pro' }) => {
    if (!payload || typeof payload.version !== 'string') {
      throw new Error('缺少内核版本号')
    }
    return revealKernelDirectory(payload.version, payload.edition)
  }
)

ipcMain.handle('workspace:get-paths', () => {
  return getWorkspacePaths()
})

ipcMain.handle('workspace:choose-directory', () => {
  return chooseWorkspaceDirectory()
})

ipcMain.handle('workspace:reveal-workspace', () => {
  return revealWorkspaceDirectory()
})

ipcMain.handle('kernels:get-mirror-url', () => {
  return loadMirrorUrl() || DEFAULT_MIRROR_URL
})

ipcMain.handle('kernels:set-mirror-url', (_event, url: string) => {
  saveMirrorUrl(url)
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.cloakbrowser.app')

  // 应用启动时加载镜像地址设置，未设置则使用默认地址
  const savedMirrorUrl = loadMirrorUrl() || DEFAULT_MIRROR_URL
  applyMirrorUrl(savedMirrorUrl)

  app.on('browser-window-created', (_, window) => {
    if (is.dev) {
      optimizer.watchWindowShortcuts(window)
    }
  })

  createWindow()
  initializeAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', async () => {
  await stopLocalServer()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
