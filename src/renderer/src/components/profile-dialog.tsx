import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { BrowserProfile, ProfileInput, SavedProxy } from '@/types'
import { useI18n } from '@/i18n'

// 预设选项数据
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Shanghai', label: '中国 (Asia/Shanghai)' },
  { value: 'Asia/Hong_Kong', label: '香港 (Asia/Hong_Kong)' },
  { value: 'Asia/Taipei', label: '台湾 (Asia/Taipei)' },
  { value: 'Asia/Tokyo', label: '日本 (Asia/Tokyo)' },
  { value: 'Asia/Seoul', label: '韩国 (Asia/Seoul)' },
  { value: 'Asia/Singapore', label: '新加坡 (Asia/Singapore)' },
  { value: 'Asia/Bangkok', label: '泰国 (Asia/Bangkok)' },
  { value: 'Asia/Jakarta', label: '印尼 (Asia/Jakarta)' },
  { value: 'Asia/Kolkata', label: '印度 (Asia/Kolkata)' },
  { value: 'Asia/Dubai', label: '迪拜 (Asia/Dubai)' },
  { value: 'Europe/London', label: '英国 (Europe/London)' },
  { value: 'Europe/Paris', label: '法国 (Europe/Paris)' },
  { value: 'Europe/Berlin', label: '德国 (Europe/Berlin)' },
  { value: 'Europe/Moscow', label: '俄罗斯 (Europe/Moscow)' },
  { value: 'America/New_York', label: '美国东部 (America/New_York)' },
  { value: 'America/Los_Angeles', label: '美国西部 (America/Los_Angeles)' },
  { value: 'America/Chicago', label: '美国中部 (America/Chicago)' },
  { value: 'America/Sao_Paulo', label: '巴西 (America/Sao_Paulo)' },
  { value: 'Australia/Sydney', label: '澳大利亚 (Australia/Sydney)' },
  { value: 'Pacific/Auckland', label: '新西兰 (Pacific/Auckland)' },
]

const LOCALE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文 (zh-CN)' },
  { value: 'zh-TW', label: '繁体中文 (zh-TW)' },
  { value: 'zh-HK', label: '香港繁体 (zh-HK)' },
  { value: 'en-US', label: 'English US (en-US)' },
  { value: 'en-GB', label: 'English UK (en-GB)' },
  { value: 'ja-JP', label: '日本語 (ja-JP)' },
  { value: 'ko-KR', label: '한국어 (ko-KR)' },
  { value: 'fr-FR', label: 'Français (fr-FR)' },
  { value: 'de-DE', label: 'Deutsch (de-DE)' },
  { value: 'es-ES', label: 'Español (es-ES)' },
  { value: 'pt-BR', label: 'Português BR (pt-BR)' },
  { value: 'ru-RU', label: 'Русский (ru-RU)' },
  { value: 'ar-SA', label: 'العربية (ar-SA)' },
  { value: 'hi-IN', label: 'हिन्दी (hi-IN)' },
  { value: 'th-TH', label: 'ไทย (th-TH)' },
  { value: 'vi-VN', label: 'Tiếng Việt (vi-VN)' },
  { value: 'id-ID', label: 'Indonesia (id-ID)' },
  { value: 'ms-MY', label: 'Melayu (ms-MY)' },
]

const SCREEN_OPTIONS = [
  { value: '1920x1080', label: '1920 × 1080 (Full HD)', width: 1920, height: 1080 },
  { value: '2560x1440', label: '2560 × 1440 (2K)', width: 2560, height: 1440 },
  { value: '3840x2160', label: '3840 × 2160 (4K)', width: 3840, height: 2160 },
  { value: '1366x768', label: '1366 × 768', width: 1366, height: 768 },
  { value: '1536x864', label: '1536 × 864', width: 1536, height: 864 },
  { value: '1440x900', label: '1440 × 900', width: 1440, height: 900 },
  { value: '1600x900', label: '1600 × 900', width: 1600, height: 900 },
  { value: '1680x1050', label: '1680 × 1050', width: 1680, height: 1050 },
  { value: '1280x720', label: '1280 × 720 (HD)', width: 1280, height: 720 },
  { value: '1280x800', label: '1280 × 800', width: 1280, height: 800 },
  { value: '2560x1600', label: '2560 × 1600 (MacBook)', width: 2560, height: 1600 },
  { value: '2880x1800', label: '2880 × 1800 (MacBook Pro)', width: 2880, height: 1800 },
]

const CPU_OPTIONS = [
  { value: '2', label: '2' },
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '16', label: '16' },
  { value: '24', label: '24' },
  { value: '32', label: '32' },
]

const MEMORY_OPTIONS = [
  { value: '2', label: '2 GB' },
  { value: '4', label: '4 GB' },
  { value: '8', label: '8 GB' },
  { value: '16', label: '16 GB' },
  { value: '32', label: '32 GB' },
  { value: '64', label: '64 GB' },
]

const STORAGE_OPTIONS = [
  { value: '1000', label: '1 GB' },
  { value: '2000', label: '2 GB' },
  { value: '5000', label: '5 GB' },
  { value: '10000', label: '10 GB' },
  { value: '20000', label: '20 GB' },
  { value: '50000', label: '50 GB' },
]

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: BrowserProfile | null
  formValues: ProfileInput
  onFormChange: (values: ProfileInput) => void
  saving: boolean
  nameError: string | null
  installedBrowserVersions: string[]
  savedProxies: SavedProxy[]
  onSave: () => void
}

function Field({
  label,
  children,
  className
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}

export function ProfileDialog({
  open,
  onOpenChange,
  editing,
  formValues,
  onFormChange,
  saving,
  nameError,
  installedBrowserVersions,
  savedProxies,
  onSave
}: ProfileDialogProps) {
  const { t } = useI18n()
  const [proxyChoice, setProxyChoice] = useState('none')
  const update = (patch: Partial<ProfileInput>) =>
    onFormChange({ ...formValues, ...patch })

  useEffect(() => {
    if (!open) return
    if (!formValues.proxy) {
      setProxyChoice('none')
      return
    }
    const savedProxy = savedProxies.find((proxy) => proxy.url === formValues.proxy)
    setProxyChoice(savedProxy?.id ?? 'custom')
  }, [open, editing?.id, savedProxies, formValues.proxy])

  const changeProxyChoice = (value: string) => {
    setProxyChoice(value)
    if (value === 'none') {
      update({ proxy: '' })
      return
    }
    if (value === 'custom') {
      if (savedProxies.some((proxy) => proxy.id === proxyChoice)) {
        update({ proxy: '' })
      }
      return
    }
    const selected = savedProxies.find((proxy) => proxy.id === value)
    if (selected) update({ proxy: selected.url })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100vh-2rem)] max-w-[720px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{editing ? t('profileDialog.editTitle') : t('profileDialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className="-mr-2 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Field label={t('profileDialog.name')} className="col-span-1">
              <Input
                placeholder={t('profileDialog.namePlaceholder')}
                value={formValues.name ?? ''}
                onChange={(e) => update({ name: e.target.value })}
              />
              {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            </Field>
            <Field label={t('profileDialog.startUrl')} className="col-span-1">
              <Input
                placeholder="https://example.com"
                value={formValues.startUrl ?? ''}
                onChange={(e) => update({ startUrl: e.target.value })}
              />
            </Field>

            <Field label={t('profileDialog.browserVersion')} className="col-span-2">
              <Select
                value={formValues.browserVersion || undefined}
                onValueChange={(value) => update({ browserVersion: value })}
                disabled={installedBrowserVersions.length === 0}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue
                    placeholder={
                      installedBrowserVersions.length
                        ? t('profileDialog.selectBrowserVersion')
                        : t('profileDialog.noKernel')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {installedBrowserVersions.map((version) => (
                    <SelectItem key={version} value={version}>
                      Chromium {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {installedBrowserVersions.length
                  ? t('profileDialog.browserVersionHint')
                  : t('profileDialog.noKernelHint')}
              </p>
            </Field>

            <Field label={t('profileDialog.proxy')} className="col-span-2">
              <Select value={proxyChoice} onValueChange={changeProxyChoice}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectProxy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('profileDialog.noProxy')}</SelectItem>
                  {savedProxies.map((proxy) => (
                    <SelectItem key={proxy.id} value={proxy.id}>
                      {proxy.name} · {proxy.protocol}://{proxy.host}:{proxy.port}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">{t('profileDialog.customProxy')}</SelectItem>
                </SelectContent>
              </Select>
              {proxyChoice === 'custom' && (
                <Input
                  placeholder="socks5://user:pass@host:port"
                  value={formValues.proxy ?? ''}
                  onChange={(event) => update({ proxy: event.target.value })}
                />
              )}
              <p className="text-xs text-muted-foreground">
                {t('profileDialog.proxyHint')}
              </p>
            </Field>

            <Field label={t('profileDialog.timezone')} className="col-span-1">
              <Select
                value={formValues.timezone || undefined}
                onValueChange={(value) => update({ timezone: value })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectTimezone')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('profileDialog.locale')} className="col-span-1">
              <Select
                value={formValues.locale || undefined}
                onValueChange={(value) => update({ locale: value })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectLocale')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {LOCALE_OPTIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('profileDialog.screenResolution')} className="col-span-2">
              <Select
                value={formValues.screenWidth && formValues.screenHeight ? `${formValues.screenWidth}x${formValues.screenHeight}` : undefined}
                onValueChange={(value) => {
                  const screen = SCREEN_OPTIONS.find((s) => s.value === value)
                  if (screen) {
                    update({ screenWidth: screen.width, screenHeight: screen.height })
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectScreen')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {SCREEN_OPTIONS.map((screen) => (
                    <SelectItem key={screen.value} value={screen.value}>
                      {screen.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('profileDialog.cpu')} className="col-span-1">
              <Select
                value={formValues.hardwareConcurrency?.toString() || undefined}
                onValueChange={(value) => update({ hardwareConcurrency: Number(value) })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectCpu')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {CPU_OPTIONS.map((cpu) => (
                    <SelectItem key={cpu.value} value={cpu.value}>
                      {cpu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('profileDialog.memory')} className="col-span-1">
              <Select
                value={formValues.deviceMemory?.toString() || undefined}
                onValueChange={(value) => update({ deviceMemory: Number(value) })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectMemory')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {MEMORY_OPTIONS.map((mem) => (
                    <SelectItem key={mem.value} value={mem.value}>
                      {mem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('profileDialog.storage')} className="col-span-2">
              <Select
                value={formValues.storageQuotaMb?.toString() || undefined}
                onValueChange={(value) => update({ storageQuotaMb: Number(value) })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t('profileDialog.selectStorage')} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {STORAGE_OPTIONS.map((storage) => (
                    <SelectItem key={storage.value} value={storage.value}>
                      {storage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="col-span-2 flex items-center gap-2.5 rounded-xl border bg-muted/40 p-3.5">
              <Checkbox
                id="geoip"
                checked={!!formValues.geoip}
                onCheckedChange={(v) => update({ geoip: !!v })}
              />
              <Label htmlFor="geoip" className="cursor-pointer text-sm">
                {t('profileDialog.geoip')}
              </Label>
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('profileDialog.geoipHint')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-background pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || installedBrowserVersions.length === 0}
          >
            {saving ? t('common.saving') : editing ? t('common.save') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
