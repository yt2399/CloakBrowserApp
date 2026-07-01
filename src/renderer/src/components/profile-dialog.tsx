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

  const numValue = (v: number | undefined) => (v === undefined ? '' : v)

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
              <Input
                placeholder="Asia/Shanghai"
                value={formValues.timezone ?? ''}
                onChange={(e) => update({ timezone: e.target.value })}
              />
            </Field>
            <Field label={t('profileDialog.locale')} className="col-span-1">
              <Input
                placeholder="zh-CN"
                value={formValues.locale ?? ''}
                onChange={(e) => update({ locale: e.target.value })}
              />
            </Field>

            <Field label={t('profileDialog.screenWidth')} className="col-span-1">
              <Input
                type="number"
                value={numValue(formValues.screenWidth)}
                onChange={(e) =>
                  update({ screenWidth: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </Field>
            <Field label={t('profileDialog.screenHeight')} className="col-span-1">
              <Input
                type="number"
                value={numValue(formValues.screenHeight)}
                onChange={(e) =>
                  update({ screenHeight: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </Field>

            <Field label={t('profileDialog.cpu')} className="col-span-1">
              <Input
                type="number"
                value={numValue(formValues.hardwareConcurrency)}
                onChange={(e) =>
                  update({
                    hardwareConcurrency: e.target.value === '' ? undefined : Number(e.target.value)
                  })
                }
              />
            </Field>
            <Field label={t('profileDialog.memory')} className="col-span-1">
              <Input
                type="number"
                value={numValue(formValues.deviceMemory)}
                onChange={(e) =>
                  update({ deviceMemory: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </Field>

            <Field label={t('profileDialog.storage')} className="col-span-2">
              <Input
                type="number"
                value={numValue(formValues.storageQuotaMb)}
                onChange={(e) =>
                  update({
                    storageQuotaMb: e.target.value === '' ? undefined : Number(e.target.value)
                  })
                }
              />
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
