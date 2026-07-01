import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Apple,
  Chrome,
  Copy,
  Download,
  ExternalLink,
  FolderOpen,
  Github,
  LoaderCircle,
  Monitor,
  RefreshCw,
  Terminal
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n, type Language } from '@/i18n'

type KernelPlatform = 'windows' | 'linux' | 'mac'

interface PlatformDownload {
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
  platforms: PlatformDownload[]
}

interface KernelReleaseResult {
  currentPlatform: KernelPlatform
  currentArchitecture: 'x64' | 'arm64'
  releases: KernelRelease[]
  fetchedAt: string
}

interface KernelDownloadProgress {
  version: string
  phase: 'downloading' | 'verifying' | 'extracting' | 'completed' | 'failed'
  percent: number | null
  downloadedMegabytes?: number
  totalMegabytes?: number
  message?: string
}

const platformLabels: Record<KernelPlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'macOS'
}

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function PlatformIcon({ platform }: { platform: KernelPlatform }) {
  if (platform === 'mac') return <Apple className="size-[18px]" />
  if (platform === 'linux') return <Terminal className="size-[18px]" />
  return <Monitor className="size-[18px]" />
}

function formatFileSize(size: number): string {
  if (!size) return ''
  const megabytes = size / 1024 / 1024
  return `${megabytes >= 100 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`
}

function formatPublishedDate(value: string | null, language: Language): string {
  if (!value) return ''
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value))
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-6 h-20 w-full" />
        </div>
      ))}
    </div>
  )
}

export function KernelsPage() {
  const { t, language } = useI18n()
  const [releaseData, setReleaseData] = useState<KernelReleaseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installedVersions, setInstalledVersions] = useState<string[]>([])
  const [downloadProgress, setDownloadProgress] = useState<
    Map<string, KernelDownloadProgress>
  >(new Map())
  const installedSet = useMemo(() => new Set(installedVersions), [installedVersions])

  const loadReleases = useCallback(async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const result = await window.kernelReleases.list(force)
      setReleaseData(result)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : t('kernels.fetchError')
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  const refreshInstalledVersions = useCallback(async () => {
    try {
      const versions = await window.kernelReleases.installedVersions()
      setInstalledVersions(versions)
    } catch {
      setInstalledVersions([])
    }
  }, [])

  useEffect(() => {
    loadReleases()
    refreshInstalledVersions()
  }, [loadReleases, refreshInstalledVersions])

  useEffect(() => {
    return window.kernelReleases.onDownloadProgress((progress) => {
      setDownloadProgress((current) => {
        const next = new Map(current)
        next.set(progress.version, progress)
        return next
      })
    })
  }, [])

  useEffect(() => {
    const onFocus = () => {
      refreshInstalledVersions()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshInstalledVersions])

  const visibleReleases = useMemo(() => {
    if (!releaseData) return []

    return releaseData.releases
      .map((release) => ({
        ...release,
        platforms: release.platforms.filter(
          (platform) =>
            platform.platform === releaseData.currentPlatform &&
            platform.architecture === releaseData.currentArchitecture
        )
      }))
      .filter((release) => release.platforms.length > 0)
  }, [releaseData])

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('kernels.copySuccess'))
    } catch {
      toast.error(t('kernels.copyError'))
    }
  }

  const openInstalledDirectory = async (version: string, edition: 'free' | 'pro') => {
    try {
      await window.kernelReleases.revealVersion({ version, edition })
    } catch (openError) {
      toast.error(openError instanceof Error ? openError.message : t('kernels.openDirectoryError'))
    }
  }

  const downloadVersion = async (version: string, edition: 'free' | 'pro') => {
    setDownloadProgress((current) => {
      const next = new Map(current)
      next.set(version, { version, phase: 'downloading', percent: 0 })
      return next
    })
    try {
      await window.kernelReleases.download({ version, edition })
      await refreshInstalledVersions()
      window.dispatchEvent(new Event('kernel-installation-changed'))
      toast.success(t('kernels.downloadSuccess', { version }))
    } catch (downloadError) {
      toast.error(
        downloadError instanceof Error ? downloadError.message : t('kernels.downloadError', { version })
      )
    } finally {
      setDownloadProgress((current) => {
        const next = new Map(current)
        next.delete(version)
        return next
      })
    }
  }

  const progressLabel = (progress: KernelDownloadProgress): string => {
    if (progress.phase === 'verifying') return t('kernels.verifying')
    if (progress.phase === 'extracting') return t('kernels.extracting')
    if (progress.phase === 'completed') return t('kernels.completed')
    if (progress.phase === 'failed') return t('kernels.failed')
    return progress.percent === null
      ? t('kernels.downloading')
      : t('kernels.downloadingPercent', { percent: progress.percent })
  }

  if (loading) return <LoadingCards />

  if (error && !releaseData) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
        <Github className="size-10 text-muted-foreground" />
        <h2 className="mt-4 text-base font-semibold">{t('kernels.loadFailedTitle')}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t('kernels.loadFailedDesc', { error })}
        </p>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => loadReleases(true)}>
            <RefreshCw className="size-4" />
            {t('common.retry')}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              openExternalUrl('https://github.com/CloakHQ/CloakBrowser/releases')
            }
          >
            <ExternalLink className="size-4" />
            {t('common.openGithub')}
          </Button>
        </div>
      </div>
    )
  }

  if (!releaseData || visibleReleases.length === 0) {
    const systemName = releaseData
      ? platformLabels[releaseData.currentPlatform]
      : t('kernels.currentSystem')

    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
        <Chrome className="size-10 text-muted-foreground" />
        <h2 className="mt-4 text-base font-semibold">
          {t('kernels.noKernelTitle', { system: systemName })}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('kernels.noKernelDesc')}
        </p>
        <Button className="mt-5" variant="outline" onClick={() => loadReleases(true)}>
          <RefreshCw className="size-4" />
          {t('common.refresh')}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-[1220px]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('kernels.visibleHint', { system: platformLabels[releaseData.currentPlatform] })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={refreshing}
          onClick={() => {
            loadReleases(true)
            refreshInstalledVersions()
          }}
        >
          {refreshing ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-4">
        {visibleReleases.map((release) => (
          <article
            key={release.tag}
            className="flex min-h-[310px] flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <Chrome className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="group flex max-w-full items-center gap-1.5 text-left"
                      onClick={() => openExternalUrl(release.releaseUrl)}
                      title={release.releaseName}
                    >
                      <h2 className="truncate text-base font-semibold">
                        {release.chromiumVersion}
                      </h2>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </button>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {release.version}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {release.prerelease && <Badge variant="outline">{t('kernels.prerelease')}</Badge>}
                  <Badge
                    variant="secondary"
                    className={
                      release.edition === 'pro'
                        ? 'bg-[#fff4e5] text-[#b54708]'
                        : 'bg-[#e9f8ef] text-[#079455]'
                    }
                  >
                    {release.edition === 'pro' ? t('kernels.pro') : t('kernels.basic')}
                  </Badge>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">{t('kernels.releaseNotes')}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {release.description}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-8 border-y py-3">
                {release.patchLabel && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('kernels.patchLabel')}</p>
                    <p className="mt-1 text-sm font-semibold">{release.patchLabel}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">{t('kernels.currentBuild')}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {release.platforms.map((platform) => platform.name).join(' / ')}
                  </p>
                </div>
                {release.publishedAt && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">{t('kernels.publishedAt')}</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatPublishedDate(release.publishedAt, language)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t bg-muted/20 px-5 py-3.5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t('kernels.systemDownload')}</p>
              <div className="divide-y">
                {release.platforms.map((platform) => {
                  const isInstalled = installedSet.has(release.version)
                  const currentProgress = downloadProgress.get(release.version)
                  const isDownloading = Boolean(
                    currentProgress && currentProgress.phase !== 'failed'
                  )
                  return (
                    <div
                      key={platform.platformTag}
                      className="flex min-h-14 items-center justify-between gap-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-white">
                          <PlatformIcon platform={platform.platform} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{platform.name}</p>
                          <p
                            className="truncate font-mono text-[11px] text-muted-foreground"
                            title={platform.archive}
                          >
                            {platform.archive}
                            {platform.size > 0 && ` · ${formatFileSize(platform.size)}`}
                          </p>
                          {currentProgress && (
                            <div className="mt-1.5 w-48">
                              <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{progressLabel(currentProgress)}</span>
                                {currentProgress.downloadedMegabytes !== undefined &&
                                  currentProgress.totalMegabytes !== undefined && (
                                    <span>
                                      {currentProgress.downloadedMegabytes}/
                                      {currentProgress.totalMegabytes} MB
                                    </span>
                                  )}
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full bg-primary transition-[width] duration-300 ${
                                    currentProgress.percent === null ? 'w-1/3 animate-pulse' : ''
                                  }`}
                                  style={
                                    currentProgress.percent === null
                                      ? undefined
                                      : { width: `${currentProgress.percent}%` }
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {isInstalled ? (
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => openInstalledDirectory(release.version, release.edition)}
                            title={t('kernels.installedTitle', { version: release.version })}
                          >
                            <FolderOpen className="size-3.5" />
                            {t('kernels.openDirectory')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8"
                            disabled={isDownloading}
                            onClick={() => downloadVersion(release.version, release.edition)}
                          >
                            {isDownloading ? (
                              <LoaderCircle className="size-3.5 animate-spin" />
                            ) : (
                              <Download className="size-3.5" />
                            )}
                            {currentProgress ? progressLabel(currentProgress) : t('kernels.download')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={t('kernels.copyDownloadUrl')}
                          onClick={() => copyUrl(platform.downloadUrl)}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={t('kernels.viewGithubRelease')}
                          onClick={() => openExternalUrl(release.releaseUrl)}
                        >
                          <Github className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
