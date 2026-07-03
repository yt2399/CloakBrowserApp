export {}

type KernelPlatform = 'windows' | 'linux' | 'mac'

interface KernelPlatformDownload {
  name: string
  platform: KernelPlatform
  architecture: 'x64' | 'arm64'
  platformTag: string
  archive: string
  downloadUrl: string
  size: number
}

interface KernelRelease {
  tag: string
  version: string
  chromiumVersion: string
  releaseName: string
  patchLabel: string | null
  description: string
  publishedAt: string | null
  releaseUrl: string
  prerelease: boolean
  edition: 'free' | 'pro'
  platforms: KernelPlatformDownload[]
}

interface KernelReleaseResult {
  currentPlatform: KernelPlatform
  currentArchitecture: 'x64' | 'arm64'
  releases: KernelRelease[]
  fetchedAt: string
}

interface KernelInstallationStatus {
  installed: boolean
  version: string
  binaryPath: string
}

interface KernelDownloadProgress {
  version: string
  phase: 'downloading' | 'verifying' | 'extracting' | 'completed' | 'failed'
  percent: number | null
  downloadedMegabytes?: number
  totalMegabytes?: number
  message?: string
}

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

declare global {
  interface Window {
    appInfo: {
      name: string
      apiBaseUrl: string
      version: string
    }
    appWindow: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<boolean>
      close: () => Promise<void>
      isMaximized: () => Promise<boolean>
    }
    kernelReleases: {
      list: (force?: boolean) => Promise<KernelReleaseResult>
      installationStatus: () => Promise<KernelInstallationStatus>
      installedVersions: () => Promise<string[]>
      download: (payload: {
        version: string
        edition: 'free' | 'pro'
      }) => Promise<{
        version: string
        edition: 'free' | 'pro'
        binaryPath: string
      }>
      onDownloadProgress: (callback: (progress: KernelDownloadProgress) => void) => () => void
      revealVersion: (payload: { version: string; edition: 'free' | 'pro' }) => Promise<void>
      getMirrorUrl: () => Promise<string>
      setMirrorUrl: (url: string) => Promise<void>
    }
    workspace: {
      getPaths: () => Promise<WorkspacePaths>
      chooseDirectory: () => Promise<WorkspacePaths | null>
      revealWorkspace: () => Promise<void>
    }
  }
}
