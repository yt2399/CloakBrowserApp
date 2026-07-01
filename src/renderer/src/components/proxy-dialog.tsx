import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import type { ProxyInput, ProxyProtocol, SavedProxy } from '@/types'
import { useI18n, type Translate } from '@/i18n'

interface ProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: SavedProxy | null
  formValues: ProxyInput
  onFormChange: (values: ProxyInput) => void
  saving: boolean
  formError: string | null
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

function previewUrl(values: ProxyInput, t: Translate): string {
  if (!values.host.trim() || !values.port) return t('proxyDialog.previewEmpty')
  const host = values.host.trim().includes(':')
    ? `[${values.host.trim().replace(/^\[|\]$/g, '')}]`
    : values.host.trim()
  const auth = values.username.trim()
    ? `${encodeURIComponent(values.username.trim())}${values.password ? ':••••••' : ''}@`
    : ''
  return `${values.protocol}://${auth}${host}:${values.port}`
}

export function ProxyDialog({
  open,
  onOpenChange,
  editing,
  formValues,
  onFormChange,
  saving,
  formError,
  onSave
}: ProxyDialogProps) {
  const { t } = useI18n()
  const update = (patch: Partial<ProxyInput>) => onFormChange({ ...formValues, ...patch })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{editing ? t('proxyDialog.editTitle') : t('proxyDialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label={t('proxyDialog.name')} className="col-span-2">
            <Input
              autoFocus
              placeholder={t('proxyDialog.namePlaceholder')}
              value={formValues.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </Field>

          <Field label={t('proxyDialog.protocol')}>
            <Select
              value={formValues.protocol}
              onValueChange={(value) => update({ protocol: value as ProxyProtocol })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
                <SelectItem value="socks4">SOCKS4</SelectItem>
                <SelectItem value="socks5">SOCKS5</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('proxyDialog.port')}>
            <Input
              type="number"
              min={1}
              max={65535}
              placeholder={t('proxyDialog.portPlaceholder')}
              value={formValues.port ?? ''}
              onChange={(event) =>
                update({ port: event.target.value ? Number(event.target.value) : undefined })
              }
            />
          </Field>

          <Field label={t('proxyDialog.host')} className="col-span-2">
            <Input
              placeholder={t('proxyDialog.hostPlaceholder')}
              value={formValues.host}
              onChange={(event) => update({ host: event.target.value })}
            />
          </Field>

          <Field label={t('proxyDialog.username')}>
            <Input
              autoComplete="off"
              placeholder={t('proxyDialog.usernamePlaceholder')}
              value={formValues.username}
              onChange={(event) => update({ username: event.target.value })}
            />
          </Field>

          <Field label={t('proxyDialog.password')}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={t('proxyDialog.passwordPlaceholder')}
              value={formValues.password}
              onChange={(event) => update({ password: event.target.value })}
            />
          </Field>

          <div className="col-span-2 rounded-lg border bg-muted/40 px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link2 className="size-3.5" />
              {t('proxyDialog.preview')}
            </div>
            <p className="break-all font-mono text-sm text-foreground">
              {previewUrl(formValues, t)}
            </p>
          </div>

          {formError && <p className="col-span-2 text-sm text-destructive">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? t('common.saving') : editing ? t('common.save') : t('proxyDialog.saveProxy')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
