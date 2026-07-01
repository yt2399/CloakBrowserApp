import { useState } from 'react'
import {
  Folders,
  FolderInput,
  FolderOpen,
  Info,
  Languages,
  LoaderCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useI18n, type Language } from '@/i18n'

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

interface SettingsPageProps {
  paths: WorkspacePaths | null
  onChange: (paths: WorkspacePaths) => void
}

export function SettingsPage({ paths, onChange }: SettingsPageProps) {
  const { t, language, setLanguage } = useI18n()
  const [choosing, setChoosing] = useState(false)
  const [opening, setOpening] = useState(false)

  const choose = async () => {
    setChoosing(true)
    try {
      const next = await window.workspace.chooseDirectory()
      if (next) {
        onChange(next)
        toast.success(t('toast.workspaceUpdated'))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.workspaceChangeFailed'))
    } finally {
      setChoosing(false)
    }
  }

  const open = async () => {
    if (!paths) return
    setOpening(true)
    try {
      await window.workspace.revealWorkspace()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.openDirectoryFailed'))
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="max-w-[900px] space-y-4">
      <article className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Languages className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{t('settings.preferenceTitle')}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t('settings.preferenceDesc')}
              </p>
            </div>
          </div>
          <div className="w-[220px] shrink-0">
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue aria-label={t('language.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">{t('language.zh')}</SelectItem>
                <SelectItem value="en">{t('language.en')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </article>

      <div className="mb-1">
        <h2 className="text-base font-semibold">{t('settings.storageTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('settings.storageDesc')}
        </p>
      </div>

      <article className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Folders className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{t('settings.workspace')}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t('settings.workspaceDesc', { kernels: 'kernels/', profiles: 'profiles/' })}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={choose} disabled={choosing}>
              {choosing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FolderInput className="size-4" />
              )}
              {t('settings.changeDirectory')}
            </Button>
            <Button variant="outline" size="sm" onClick={open} disabled={!paths || opening}>
              {opening ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FolderOpen className="size-4" />
              )}
              {t('settings.openDirectory')}
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/30 px-3.5 py-3">
          {paths ? (
            <p className="break-all font-mono text-xs leading-5 text-foreground" title={paths.workspaceDirectory}>
              {paths.workspaceDirectory}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" />
              {t('settings.loadingPath')}
            </div>
          )}
        </div>
      </article>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div className="text-sm leading-6">
          <p className="font-medium">{t('settings.warningTitle')}</p>
          <p className="mt-1 text-amber-800/90">
            {t('settings.warningDesc', { userDataDir: 'userDataDir', profiles: 'profiles/' })}
          </p>
        </div>
      </div>
    </div>
  )
}
