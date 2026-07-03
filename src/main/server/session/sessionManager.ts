import type { BrowserContext } from 'playwright-core'
import { createServer } from 'node:net'
import { getInstalledKernelVersions } from '../../kernel-releases'
import type { BrowserProfile, ProfileStatus } from '../profile/types'

type CloakBrowserModule = {
  launchPersistentContext(options: {
    userDataDir: string
    headless?: boolean
    proxy?: string
    geoip?: boolean
    timezone?: string
    locale?: string
    browserVersion?: string
    args?: string[]
  }): Promise<BrowserContext>
}

export interface SessionInfo {
  profileId: string
  status: 'running'
  remoteDebuggingPort: number
  remoteDebuggingAddress: string
}

interface RunningSession {
  context: BrowserContext
  remoteDebuggingPort: number
  remoteDebuggingAddress: string
}

const REMOTE_DEBUGGING_HOST = '127.0.0.1'
const REMOTE_DEBUGGING_START_PORT = 9222
const REMOTE_DEBUGGING_END_PORT = 65535

function canUsePort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen(port, REMOTE_DEBUGGING_HOST)
  })
}

async function allocateRemoteDebuggingPort(usedPorts: Set<number>): Promise<number> {
  for (let port = REMOTE_DEBUGGING_START_PORT; port <= REMOTE_DEBUGGING_END_PORT; port += 1) {
    if (usedPorts.has(port)) continue
    if (await canUsePort(port)) return port
  }

  throw new Error('没有可用的远程调试端口')
}

export class SessionManager {
  private sessions = new Map<string, RunningSession>()
  private reservedRemoteDebuggingPorts = new Set<number>()
  private portAllocationQueue: Promise<void> = Promise.resolve()

  getStatus(profileId: string): ProfileStatus {
    return this.sessions.has(profileId) ? 'running' : 'stopped'
  }

  getSession(profileId: string): SessionInfo | null {
    const session = this.sessions.get(profileId)
    if (!session) return null

    return {
      profileId,
      status: 'running',
      remoteDebuggingPort: session.remoteDebuggingPort,
      remoteDebuggingAddress: session.remoteDebuggingAddress
    }
  }

  list(): SessionInfo[] {
    return Array.from(this.sessions.keys()).map((profileId) => this.getSession(profileId)!)
  }

  private async reserveRemoteDebuggingPort(): Promise<number> {
    const previousAllocation = this.portAllocationQueue
    let releaseAllocation!: () => void
    this.portAllocationQueue = new Promise((resolve) => {
      releaseAllocation = resolve
    })

    await previousAllocation
    try {
      const usedPorts = new Set([
        ...Array.from(this.sessions.values()).map((session) => session.remoteDebuggingPort),
        ...this.reservedRemoteDebuggingPorts
      ])
      const port = await allocateRemoteDebuggingPort(usedPorts)
      this.reservedRemoteDebuggingPorts.add(port)
      return port
    } finally {
      releaseAllocation()
    }
  }

  async open(profile: BrowserProfile): Promise<SessionInfo> {
    const existingSession = this.getSession(profile.id)
    if (existingSession) return existingSession
    if (!profile.browserVersion) {
      throw new Error('请先编辑环境并选择浏览器版本')
    }

    const installedVersions = await getInstalledKernelVersions()
    if (!installedVersions.includes(profile.browserVersion)) {
      throw new Error(`浏览器版本 ${profile.browserVersion} 未安装，请重新选择`)
    }

    const remoteDebuggingPort = await this.reserveRemoteDebuggingPort()
    const remoteDebuggingAddress = `http://${REMOTE_DEBUGGING_HOST}:${remoteDebuggingPort}/${profile.id}`

    const args = [
      `--fingerprint=${profile.seed}`,
      `--fingerprint-platform=${profile.platform}`,
      `--fingerprint-storage-quota=${profile.storageQuotaMb}`,
      `--fingerprint-screen-width=${profile.screenWidth}`,
      `--fingerprint-screen-height=${profile.screenHeight}`,
      `--fingerprint-hardware-concurrency=${profile.hardwareConcurrency}`,
      `--fingerprint-device-memory=${profile.deviceMemory}`,
      `--remote-debugging-address=${REMOTE_DEBUGGING_HOST}`,
      `--remote-debugging-port=${remoteDebuggingPort}`
    ]

    let context: BrowserContext | null = null

    try {
      const cloak = (await import('cloakbrowser')) as CloakBrowserModule
      context = await cloak.launchPersistentContext({
        userDataDir: profile.userDataDir,
        headless: false,
        proxy: profile.proxy || undefined,
        geoip: Boolean(profile.proxy && profile.geoip),
        timezone: profile.timezone,
        locale: profile.locale,
        browserVersion: profile.browserVersion,
        args
      })

      // 从 /json/version 获取 WebSocket 地址
      let finalAddress = remoteDebuggingAddress
      try {
        const versionResp = await fetch(
          `http://${REMOTE_DEBUGGING_HOST}:${remoteDebuggingPort}/json/version`
        )
        if (versionResp.ok) {
          const version = (await versionResp.json()) as { webSocketDebuggerUrl?: string }
          if (version.webSocketDebuggerUrl) {
            finalAddress = version.webSocketDebuggerUrl
          }
        }
      } catch {
        // 获取失败则使用原始 HTTP 地址
      }

      this.sessions.set(profile.id, {
        context,
        remoteDebuggingPort,
        remoteDebuggingAddress: finalAddress
      })

      const existing = context.pages()[0]
      const page = existing || (await context.newPage())
      await page.goto(profile.startUrl, { waitUntil: 'domcontentloaded' }).catch((error) => {
        console.warn(
          `启动网址加载失败，浏览器环境已保持运行：${profile.startUrl}`,
          error instanceof Error ? error.message : error
        )
      })

      context.on('close', () => {
        this.sessions.delete(profile.id)
      })

      return this.getSession(profile.id)!
    } catch (error) {
      if (this.sessions.get(profile.id)?.context === context) {
        this.sessions.delete(profile.id)
      }
      await context?.close().catch(() => undefined)
      throw error
    } finally {
      this.reservedRemoteDebuggingPorts.delete(remoteDebuggingPort)
    }
  }

  async close(profileId: string): Promise<void> {
    const session = this.sessions.get(profileId)
    if (!session) return
    this.sessions.delete(profileId)
    await session.context.close()
  }

  async closeAll(): Promise<void> {
    await Promise.all(Array.from(this.sessions.keys()).map((id) => this.close(id)))
  }
}
