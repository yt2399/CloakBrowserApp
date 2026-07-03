import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { ApiPage } from '@/components/api-page'
import { AppSidebar, type PageKey, pageTitle } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { KernelsPage } from '@/components/kernels-page'
import { ProfilesPage } from '@/components/profiles-page'
import { ProxyPage } from '@/components/proxy-page'
import { SettingsPage } from '@/components/settings-page'
import { SiteHeader } from '@/components/site-header'
import { Titlebar } from '@/components/titlebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { useProfiles } from '@/hooks/use-profiles'
import { useProxies } from '@/hooks/use-proxies'
import { useI18n } from '@/i18n'

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

export default function App() {
  const { t } = useI18n()
  const [activePage, setActivePage] = useState<PageKey>('profiles')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [kernelInstalled, setKernelInstalled] = useState(false)
  const [workspacePaths, setWorkspacePaths] = useState<WorkspacePaths | null>(null)
  const store = useProfiles()
  const proxyStore = useProxies()
  const isKernelsPage = activePage === 'kernels'

  const refreshKernelStatus = useCallback(async () => {
    try {
      const status = await window.kernelReleases.installationStatus()
      setKernelInstalled(status.installed)
    } catch {
      setKernelInstalled(false)
    }
  }, [])

  const refreshWorkspacePaths = useCallback(async () => {
    try {
      setWorkspacePaths(await window.workspace.getPaths())
    } catch {
      setWorkspacePaths(null)
    }
  }, [])

  const handleWorkspaceChange = useCallback(
    async (next: WorkspacePaths) => {
      setWorkspacePaths(next)
      await refreshKernelStatus()
    },
    [refreshKernelStatus]
  )

  useEffect(() => {
    refreshKernelStatus()
    refreshWorkspacePaths()

    const refreshLocalState = () => {
      refreshKernelStatus()
      refreshWorkspacePaths()
    }

    window.addEventListener('focus', refreshLocalState)
    window.addEventListener('kernel-installation-changed', refreshKernelStatus)
    return () => {
      window.removeEventListener('focus', refreshLocalState)
      window.removeEventListener('kernel-installation-changed', refreshKernelStatus)
    }
  }, [refreshKernelStatus, refreshWorkspacePaths])

  return (
    <div className="grid h-screen grid-rows-[44px_1fr] bg-background">
      <Titlebar
        kernelInstalled={kernelInstalled}
        onOpenKernels={() => setActivePage('kernels')}
      />
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="min-h-0"
      >
        <AppSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={!sidebarOpen}
        />
        <SidebarInset className="w-0 min-w-0 max-w-full bg-white">
          <SiteHeader
            title={pageTitle(activePage, t)}
            subtitle={
              isKernelsPage
                ? t('header.kernelsSubtitle')
                : activePage === 'proxy'
                  ? t('header.proxySubtitle')
                  : activePage === 'settings'
                    ? t('header.settingsSubtitle')
                    : activePage === 'api'
                      ? t('api.subtitle')
                      : undefined
            }
            action={
              isKernelsPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      'https://github.com/CloakHQ/CloakBrowser/releases',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="size-4" />
                  {t('common.viewReleases')}
                </Button>
              ) : undefined
            }
          />
          <main className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6">
            {activePage === 'profiles' && (
              <ProfilesPage store={store} savedProxies={proxyStore.proxies} />
            )}
            {activePage === 'kernels' && <KernelsPage />}
            {activePage === 'settings' && (
              <SettingsPage paths={workspacePaths} onChange={handleWorkspaceChange} />
            )}
            {activePage === 'proxy' && <ProxyPage store={proxyStore} />}
            {activePage === 'api' && <ApiPage />}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-center" />
    </div>
  )
}
