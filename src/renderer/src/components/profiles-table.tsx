import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Edit3,
  HelpCircle,
  MoreVertical,
  Play,
  Square
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatTime } from '@/hooks/use-profiles'
import type { BrowserProfile, ProfileStatus } from '@/types'
import { useI18n } from '@/i18n'

interface ProfilesTableProps {
  loading: boolean
  pagedProfiles: BrowserProfile[]
  selectedKeys: string[]
  onSelectionChange: (keys: string[]) => void
  allFilteredIds: string[]
  currentPage: number
  totalPages: number
  total: number
  gotoPage: (n: number) => void
  onOpen: (id: string) => void
  onClose: (id: string) => void
  onEdit: (profile: BrowserProfile) => void
  onDelete: (profile: BrowserProfile) => void
}

function StatusBadge({ status }: { status: ProfileStatus }) {
  const { t } = useI18n()

  if (status === 'running') {
    return (
      <Badge variant="secondary" className="gap-1 bg-[#e9f8ef] text-[#079455]">
        <CheckCircle2 className="size-3" />
        {t('status.running')}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-[#f2f4f7] text-[#667085]">
      <Circle className="size-3" />
      {t('status.stopped')}
    </Badge>
  )
}

function platformLabel(platform: BrowserProfile['platform']): string {
  if (platform === 'macos') return 'macOS'
  return platform[0].toUpperCase() + platform.slice(1)
}

export function ProfilesTable({
  loading,
  pagedProfiles,
  selectedKeys,
  onSelectionChange,
  allFilteredIds,
  currentPage,
  totalPages,
  total,
  gotoPage,
  onOpen,
  onClose,
  onEdit,
  onDelete
}: ProfilesTableProps) {
  const { t, language } = useI18n()
  const allSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedKeys.includes(id))
  const someSelected = allFilteredIds.some((id) => selectedKeys.includes(id))

  const toggleAll = () => {
    if (allSelected) onSelectionChange([])
    else onSelectionChange(allFilteredIds)
  }

  const toggleRow = (id: string) => {
    if (selectedKeys.includes(id)) {
      onSelectionChange(selectedKeys.filter((key) => key !== id))
    } else {
      onSelectionChange([...selectedKeys, id])
    }
  }

  const copyRemoteDebuggingAddress = async (address: string | null) => {
    if (!address) {
      toast.warning(t('toast.remoteDebuggingUnavailable'))
      return
    }

    try {
      await navigator.clipboard.writeText(address)
      toast.success(t('toast.remoteDebuggingCopied'))
    } catch {
      toast.error(t('toast.copyFailed'))
    }
  }

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <Table className="min-w-[1080px]">
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[52px] px-4">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={toggleAll}
                aria-label={t('table.selectAll')}
              />
            </TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">{t('table.name')}</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">{t('table.status')}</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">{t('table.proxy')}</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">{t('table.timezoneLanguage')}</TableHead>
            <TableHead className="h-[50px] px-4 text-[13px] font-semibold text-[#344054]">{t('table.lastOpened')}</TableHead>
            <TableHead className="sticky right-0 z-20 h-[50px] w-[168px] min-w-[168px] bg-card px-4 text-right text-[13px] font-semibold text-[#344054] shadow-[-8px_0_12px_-12px_rgba(16,24,40,0.35)]">
              {t('table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`} className="border-b">
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-44" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="px-4 py-3"><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="sticky right-0 z-10 bg-card px-4 py-3 shadow-[-8px_0_12px_-12px_rgba(16,24,40,0.35)]">
                  <Skeleton className="ml-auto h-5 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : pagedProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                {t('table.emptyProfiles')}
              </TableCell>
            </TableRow>
          ) : (
            pagedProfiles.map((record) => {
              const platform = platformLabel(record.platform)
              const versionLabel = record.browserVersion
                ? t('table.browserVersion', { version: record.browserVersion, platform })
                : t('table.notSelectedVersion', { platform })

              return (
                <TableRow key={record.id} className="group border-b last:border-0">
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedKeys.includes(record.id)}
                      onCheckedChange={() => toggleRow(record.id)}
                      aria-label={t('table.selectProfile', { name: record.name })}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg bg-primary text-primary-foreground">
                        <AvatarFallback className="rounded-lg bg-transparent text-sm font-semibold text-white">
                          {record.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium text-[#344054]">{record.name}</span>
                        <span
                          className="truncate font-mono text-[11px] text-muted-foreground"
                          title={versionLabel}
                        >
                          {versionLabel}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3"><StatusBadge status={record.status} /></TableCell>
                  <TableCell className="px-4 py-3">
                    {record.proxy ? (
                      <span
                        className="block max-w-[220px] truncate font-mono text-xs text-[#475467]"
                        title={record.proxy}
                      >
                        {record.proxy}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="bg-[#f2f4f7] text-[#667085]">{t('table.noProxy')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-mono text-xs text-[#475467]" title={record.timezone}>
                        {record.timezone}
                      </span>
                      <span className="truncate text-xs text-muted-foreground" title={record.locale}>
                        {record.locale}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                    {formatTime(record.lastOpenedAt, language)}
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-card px-4 py-3 shadow-[-8px_0_12px_-12px_rgba(16,24,40,0.35)] transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center justify-end gap-1">
                      {record.status === 'running' ? (
                        <>
                          {record.remoteDebuggingAddress ? (
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg"
                              onClick={() => copyRemoteDebuggingAddress(record.remoteDebuggingAddress)}
                              title={t('table.copyRemoteDebuggingAddress', {
                                address: record.remoteDebuggingAddress
                              })}
                              aria-label={t('table.copyRemoteDebuggingAddress', {
                                address: record.remoteDebuggingAddress
                              })}
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-lg"
                            onClick={() => onClose(record.id)}
                            title={t('table.stop')}
                          >
                            <Square className="size-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 rounded-lg border-foreground/20 text-foreground hover:bg-accent"
                          onClick={() => onOpen(record.id)}
                          title={t('table.start')}
                        >
                          <Play className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg"
                        onClick={() => onEdit(record)}
                        title={t('common.edit')}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                            title={t('common.more')}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t('table.copyConfig')}</DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              if (record.status !== 'running') {
                                toast.warning(t('toast.profileNotRunning'))
                                return
                              }
                              copyRemoteDebuggingAddress(record.remoteDebuggingAddress)
                            }}
                          >
                            {t('table.copyCdpAddress')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="ml-1 inline-flex cursor-help items-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <HelpCircle className="size-3.5 text-muted-foreground hover:text-foreground" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t('table.cdpTooltip')}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(record)}
                          >
                            {t('table.deleteProfile')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="text-sm text-muted-foreground">{t('common.total', { count: total })}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage <= 1}
            onClick={() => gotoPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1
            return (
              <Button
                key={p}
                variant={p === currentPage ? 'default' : 'outline'}
                size="icon"
                className="size-8 text-sm"
                onClick={() => gotoPage(p)}
              >
                {p}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage >= totalPages}
            onClick={() => gotoPage(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
