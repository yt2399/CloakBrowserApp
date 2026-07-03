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
  status: ProfileStatus
  remoteDebuggingPort: number | null
  remoteDebuggingAddress: string | null
}

export type ProfileInput = Partial<
  Pick<
    BrowserProfile,
    | 'name'
    | 'proxy'
    | 'geoip'
    | 'timezone'
    | 'locale'
    | 'platform'
    | 'browserVersion'
    | 'screenWidth'
    | 'screenHeight'
    | 'hardwareConcurrency'
    | 'deviceMemory'
    | 'storageQuotaMb'
    | 'startUrl'
  >
>

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
  succeed: boolean
  timestamp: number
}

export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5'

export interface SavedProxy {
  id: string
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username: string
  password: string
  url: string
  createdAt: number
  updatedAt: number
}

export interface ProxyInput {
  name: string
  protocol: ProxyProtocol
  host: string
  port: number | undefined
  username: string
  password: string
}
