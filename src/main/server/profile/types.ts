export type ProfileStatus = 'running' | 'stopped'

export interface BrowserProfile {
  id: string
  name: string
  seed: string
  userDataDir: string
  proxy: string
  geoip: boolean
  timezone: string
  locale: string
  platform: 'windows' | 'macos' | 'linux'
  browserVersion: string
  screenWidth: number
  screenHeight: number
  hardwareConcurrency: number
  deviceMemory: number
  storageQuotaMb: number
  startUrl: string
  createdAt: number
  updatedAt: number
  lastOpenedAt: number | null
}

export interface ProfileInput {
  name?: string
  proxy?: string
  geoip?: boolean
  timezone?: string
  locale?: string
  platform?: 'windows' | 'macos' | 'linux'
  browserVersion?: string
  screenWidth?: number
  screenHeight?: number
  hardwareConcurrency?: number
  deviceMemory?: number
  storageQuotaMb?: number
  startUrl?: string
}

export interface ProfileListItem extends BrowserProfile {
  status: ProfileStatus
  remoteDebuggingPort: number | null
  remoteDebuggingAddress: string | null
}
