import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { proxyApi } from '@/request'
import type { ProxyInput, SavedProxy } from '@/types'
import { useI18n } from '@/i18n'

const defaultForm: ProxyInput = {
  name: '',
  protocol: 'socks5',
  host: '',
  port: undefined,
  username: '',
  password: ''
}

export function useProxies() {
  const { t } = useI18n()
  const [proxies, setProxies] = useState<SavedProxy[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceOnline, setServiceOnline] = useState(true)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formValues, setFormValues] = useState<ProxyInput>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavedProxy | null>(null)
  const [editTarget, setEditTarget] = useState<SavedProxy | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setProxies(await proxyApi.list())
      setServiceOnline(true)
    } catch {
      setProxies([])
      setServiceOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openCreate = () => {
    setEditTarget(null)
    setFormValues(defaultForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (proxy: SavedProxy) => {
    setEditTarget(proxy)
    setFormValues({
      name: proxy.name,
      protocol: proxy.protocol,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password
    })
    setFormError(null)
    setModalOpen(true)
  }

  const save = async () => {
    if (!formValues.name.trim()) {
      setFormError(t('toast.proxyNameRequired'))
      return
    }
    if (!formValues.host.trim()) {
      setFormError(t('toast.proxyHostRequired'))
      return
    }
    if (!formValues.port) {
      setFormError(t('toast.proxyPortRequired'))
      return
    }

    setFormError(null)
    setSaving(true)
    try {
      if (editTarget) {
        const updated = await proxyApi.update(editTarget.id, formValues)
        setProxies((items) => items.map((item) => (item.id === editTarget.id ? updated : item)))
        toast.success(t('toast.proxyUpdated'))
      } else {
        const created = await proxyApi.create(formValues)
        setProxies((items) => [created, ...items])
        toast.success(t('toast.proxySaved'))
      }
      setEditTarget(null)
      setModalOpen(false)
      setServiceOnline(true)
    } catch (error) {
      toast.error(
        serviceOnline
          ? error instanceof Error
            ? error.message
            : t('toast.saveProxyFailed')
          : t('toast.serviceOffline')
      )
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    try {
      await proxyApi.remove(target.id)
      setProxies((items) => items.filter((item) => item.id !== target.id))
      toast.success(t('toast.proxyDeleted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.deleteProxyFailed'))
    }
  }

  return {
    proxies,
    filteredProxies: proxies.filter((proxy) =>
      `${proxy.name} ${proxy.protocol} ${proxy.host} ${proxy.port} ${proxy.username} ${proxy.url}`
        .toLowerCase()
        .includes(query.toLowerCase())
    ),
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
    confirmDelete,
    refresh
  }
}

export type ProxiesStore = ReturnType<typeof useProxies>
