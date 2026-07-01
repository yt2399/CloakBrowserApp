import { Copy, Globe2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProxyDialog } from '@/components/proxy-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatTime } from '@/hooks/use-profiles'
import type { ProxiesStore } from '@/hooks/use-proxies'
import type { SavedProxy } from '@/types'
import { useI18n } from '@/i18n'

function maskedUrl(proxy: SavedProxy): string {
  const host = proxy.host.includes(':') ? `[${proxy.host}]` : proxy.host
  const auth = proxy.username
    ? `${proxy.username}${proxy.password ? ':••••••' : ''}@`
    : ''
  return `${proxy.protocol}://${auth}${host}:${proxy.port}`
}

export function ProxyPage({ store }: { store: ProxiesStore }) {
  const { t, language } = useI18n()
  const {
    filteredProxies,
    loading,
    query,
    setQuery,
    modalOpen,
    setModalOpen,
    formValues,
    setFormValues,
    saving,
    formError,
    openCreate,
    openEdit,
    editTarget,
    save,
    deleteTarget,
    setDeleteTarget,
    confirmDelete
  } = store

  const copyUrl = async (proxy: SavedProxy) => {
    try {
      await navigator.clipboard.writeText(proxy.url)
      toast.success(t('toast.proxyCopied'))
    } catch {
      toast.error(t('toast.copyFailed'))
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <h3 className="text-base font-semibold">{t('proxy.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('proxy.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[300px] max-w-full">
            <Search className="absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('proxy.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[42px] pl-9"
            />
          </div>
          <Button className="h-[42px]" onClick={openCreate}>
            <Plus className="size-[18px]" />
            {t('proxy.create')}
          </Button>
        </div>
      </section>

      <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('table.name')}
              </TableHead>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('proxy.protocol')}
              </TableHead>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('proxy.hostPort')}
              </TableHead>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('proxy.account')}
              </TableHead>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('proxy.url')}
              </TableHead>
              <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">
                {t('proxy.createdAt')}
              </TableHead>
              <TableHead className="h-[50px] w-[100px] px-4 text-right text-[13px] font-semibold text-[#344054]">
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cell) => (
                    <TableCell key={cell} className="px-4 py-3">
                      <Skeleton className="h-5 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredProxies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="rounded-full bg-muted p-3">
                      <Globe2 className="size-5" />
                    </div>
                    <p className="font-medium text-foreground">
                      {query ? t('proxy.emptySearchTitle') : t('proxy.emptyTitle')}
                    </p>
                    <p className="text-sm">
                      {query ? t('proxy.emptySearchDesc') : t('proxy.emptyDesc')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProxies.map((proxy) => (
                <TableRow key={proxy.id}>
                  <TableCell className="px-4 py-3 font-medium">{proxy.name}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="uppercase">
                      {proxy.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs">
                    {proxy.host}:{proxy.port}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {proxy.username || t('common.noAuth')}
                  </TableCell>
                  <TableCell className="max-w-[320px] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => copyUrl(proxy)}
                      className="group flex max-w-full cursor-pointer items-center gap-2 text-left"
                      title={t('proxy.copyTitle')}
                    >
                      <span className="truncate font-mono text-xs">{maskedUrl(proxy)}</span>
                      <Copy className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                    {formatTime(proxy.createdAt, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={t('proxy.editAria', { name: proxy.name })}
                        onClick={() => openEdit(proxy)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={t('proxy.deleteAria', { name: proxy.name })}
                        onClick={() => setDeleteTarget(proxy)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProxyDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editTarget}
        formValues={formValues}
        onFormChange={setFormValues}
        saving={saving}
        formError={formError}
        onSave={save}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('proxy.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('proxy.deleteDesc', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
