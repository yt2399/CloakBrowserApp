import { Maximize2, Minus, X } from 'lucide-react'
import logoUrl from '@/assets/logo.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

export function Titlebar({
  kernelInstalled,
  onOpenKernels
}: {
  kernelInstalled: boolean
  onOpenKernels: () => void
}) {
  const { t } = useI18n()

  return (
    <header className="flex h-11 items-center justify-between border-b bg-background px-3 [-webkit-app-region:drag]">
      <div className="flex items-center gap-2">
        <img
          src={logoUrl}
          alt=""
          className="size-8 rounded-lg object-cover"
          aria-hidden="true"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">CloakBrowserDesktop</span>
          <Badge variant="secondary" className="bg-muted text-foreground">
            v{window.appInfo?.version ?? '0.0.0'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenKernels}
          className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [-webkit-app-region:no-drag]"
          title={t('titlebar.openKernels')}
        >
          <span
            className={
              kernelInstalled
                ? 'size-2 rounded-full bg-[#17b26a]'
                : 'size-2 rounded-full bg-[#98a2b3]'
            }
          />
          {kernelInstalled ? t('titlebar.kernelReady') : t('titlebar.kernelMissing')}
        </button>
        <div className="flex items-center [-webkit-app-region:no-drag]">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-accent hover:text-foreground"
            onClick={() => window.appWindow?.minimize()}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-accent hover:text-foreground"
            onClick={() => window.appWindow?.toggleMaximize()}
          >
            <Maximize2 className="size-[15px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md text-[#4d5668] hover:bg-destructive hover:text-white"
            onClick={() => window.appWindow?.close()}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
