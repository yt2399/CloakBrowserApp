import { contextBridge, ipcRenderer } from 'electron'

declare const __APP_VERSION__: string

contextBridge.exposeInMainWorld('appInfo', {
  name: 'CloakBrowserDesktop',
  apiBaseUrl: 'http://127.0.0.1:6788/api',
  version: __APP_VERSION__
})

contextBridge.exposeInMainWorld('appWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized')
})

contextBridge.exposeInMainWorld('kernelReleases', {
  list: (force = false) => ipcRenderer.invoke('kernels:list-releases', force),
  installationStatus: () => ipcRenderer.invoke('kernels:installation-status'),
  installedVersions: () => ipcRenderer.invoke('kernels:installed-versions') as Promise<string[]>,
  download: (payload: { version: string; edition: 'free' | 'pro' }) =>
    ipcRenderer.invoke('kernels:download', payload) as Promise<{
      version: string
      edition: 'free' | 'pro'
      binaryPath: string
    }>,
  onDownloadProgress: (
    callback: (progress: {
      version: string
      phase: 'downloading' | 'verifying' | 'extracting' | 'completed' | 'failed'
      percent: number | null
      downloadedMegabytes?: number
      totalMegabytes?: number
      message?: string
    }) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      progress: {
        version: string
        phase: 'downloading' | 'verifying' | 'extracting' | 'completed' | 'failed'
        percent: number | null
        downloadedMegabytes?: number
        totalMegabytes?: number
        message?: string
      }
    ) => callback(progress)
    ipcRenderer.on('kernels:download-progress', listener)
    return () => ipcRenderer.removeListener('kernels:download-progress', listener)
  },
  revealVersion: (payload: { version: string; edition: 'free' | 'pro' }) =>
    ipcRenderer.invoke('kernels:reveal-version', payload) as Promise<void>,
  getMirrorUrl: () => ipcRenderer.invoke('kernels:get-mirror-url') as Promise<string>,
  setMirrorUrl: (url: string) => ipcRenderer.invoke('kernels:set-mirror-url', url) as Promise<void>
})

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

contextBridge.exposeInMainWorld('workspace', {
  getPaths: () => ipcRenderer.invoke('workspace:get-paths') as Promise<WorkspacePaths>,
  chooseDirectory: () =>
    ipcRenderer.invoke('workspace:choose-directory') as Promise<WorkspacePaths | null>,
  revealWorkspace: () => ipcRenderer.invoke('workspace:reveal-workspace') as Promise<void>
})
