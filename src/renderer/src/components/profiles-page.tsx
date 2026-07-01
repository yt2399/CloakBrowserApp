import { Filter, Play, Plus, Search, StopCircle, Trash2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileDialog } from '@/components/profile-dialog'
import { ProfilesTable } from '@/components/profiles-table'
import type { ProfilesStore } from '@/hooks/use-profiles'
import type { SavedProxy } from '@/types'
import { useI18n } from '@/i18n'

export function ProfilesPage({
  store,
  savedProxies
}: {
  store: ProfilesStore
  savedProxies: SavedProxy[]
}) {
  const { t } = useI18n()
  const {
    loading,
    pagedProfiles,
    selectedKeys,
    setSelectedKeys,
    allFilteredIds,
    currentPage,
    totalPages,
    query,
    setQuery,
    tab,
    setTab,
    counts,
    modalOpen,
    setModalOpen,
    editing,
    formValues,
    setFormValues,
    saving,
    nameError,
    installedBrowserVersions,
    openCreate,
    openEdit,
    save,
    gotoPage,
    deleteTarget,
    batchDeleteOpen,
    requestDelete,
    confirmDelete,
    cancelDelete,
    requestBatchDelete,
    confirmBatchDelete,
    cancelBatchDelete,
    openProfile,
    closeProfile,
    batchSetStatus
  } = store

  const tabs: Array<{ key: 'all' | 'running' | 'stopped'; label: string }> = [
    { key: 'all', label: t('profiles.all', { count: counts.all }) },
    { key: 'running', label: t('profiles.running', { count: counts.running }) },
    { key: 'stopped', label: t('profiles.stopped', { count: counts.stopped }) }
  ]

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-[360px] flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[330px]">
                <Search className="absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('profiles.searchPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-[42px] pl-9"
                />
              </div>
              <Button variant="outline" className="h-[42px]">
                <Filter className="size-4" />
                {t('profiles.filter')}
              </Button>
            </div>
            <div className="flex items-center gap-9">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`relative h-[42px] cursor-pointer border-0 bg-transparent text-sm transition ${
                    tab === item.key
                      ? 'font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-primary after:content-[""]'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-[410px] flex-col items-end gap-4">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Select defaultValue="all-tz">
                <SelectTrigger className="h-[42px] w-[136px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-tz">{t('profiles.allTimezone')}</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-status">
                <SelectTrigger className="h-[42px] w-[136px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">{t('profiles.allStatus')}</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-[42px]" onClick={openCreate}>
                <Plus className="size-[18px]" />
                {t('profiles.create')}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                className="h-[42px]"
                onClick={() => batchSetStatus('running')}
              >
                <Play className="size-4" />
                {t('profiles.batchStart')}
              </Button>
              <Button
                variant="outline"
                className="h-[42px]"
                onClick={() => batchSetStatus('stopped')}
              >
                <StopCircle className="size-4" />
                {t('profiles.batchStop')}
              </Button>
              <Button
                variant="outline"
                className="h-[42px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={selectedKeys.length === 0}
                onClick={requestBatchDelete}
              >
                <Trash2 className="size-4" />
                {t('profiles.batchDelete')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ProfilesTable
        loading={loading}
        pagedProfiles={pagedProfiles}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        allFilteredIds={allFilteredIds}
        currentPage={currentPage}
        totalPages={totalPages}
        total={allFilteredIds.length}
        gotoPage={gotoPage}
        onOpen={openProfile}
        onClose={closeProfile}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      <ProfileDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        formValues={formValues}
        onFormChange={setFormValues}
        saving={saving}
        nameError={nameError}
        installedBrowserVersions={installedBrowserVersions}
        savedProxies={savedProxies}
        onSave={save}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) cancelDelete()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profiles.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profiles.deleteDesc', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={batchDeleteOpen}
        onOpenChange={(open) => {
          if (!open) cancelBatchDelete()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profiles.batchDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profiles.batchDeleteDesc', { count: selectedKeys.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                confirmBatchDelete()
              }}
            >
              {t('profiles.deleteCount', { count: selectedKeys.length })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
