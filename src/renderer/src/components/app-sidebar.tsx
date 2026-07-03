import { AppWindow, ArrowUpRight, Chrome, Globe2, Settings, Terminal } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useI18n, type Translate, type TranslationKey } from '@/i18n'

export type PageKey = 'profiles' | 'proxy' | 'kernels' | 'settings' | 'api'

const navigationItems: Array<{
  key: PageKey
  labelKey: TranslationKey
  icon: React.ReactNode
}> = [
  { key: 'profiles', labelKey: 'nav.profiles', icon: <AppWindow className="size-[19px]" /> },
  { key: 'proxy', labelKey: 'nav.proxy', icon: <Globe2 className="size-[19px]" /> },
  { key: 'kernels', labelKey: 'nav.kernels', icon: <Chrome className="size-[19px]" /> },
  { key: 'api', labelKey: 'nav.api', icon: <Terminal className="size-[19px]" /> },
  { key: 'settings', labelKey: 'nav.settings', icon: <Settings className="size-[19px]" /> }
]

export function pageTitle(page: PageKey, t: Translate): string {
  const item = navigationItems.find((entry) => entry.key === page)
  return item ? t(item.labelKey) : ''
}

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function AppSidebar({
  activePage,
  onNavigate,
  collapsed
}: {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
  collapsed: boolean
}) {
  const { t } = useI18n()

  return (
    <Sidebar
      collapsible="none"
      className="border-r transition-[width] duration-200 ease-linear"
      style={
        { '--sidebar-width': collapsed ? '3.5rem' : '13rem' } as React.CSSProperties
      }
    >
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{t('nav.label')}</SidebarGroupLabel>}
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  isActive={activePage === item.key}
                  onClick={() => onNavigate(item.key)}
                >
                  {item.icon}
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => openExternalUrl('https://fluxbrowser.cn/')}
              className="group relative w-full overflow-hidden rounded-xl border border-[#202124] bg-[#101114] p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div>
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/70">
                  FLUXBROWSER
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-5">{t('nav.professional.title')}</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                {t('nav.professional.desc')}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-medium">
                <span>{t('nav.professional.link')}</span>
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-white text-[#101114] transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
