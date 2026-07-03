import { Router } from 'express'
import { apiHandler } from '../controllers/apiHandler'
import type { ProfileStore } from '../profile/profileStore'
import type { SessionManager } from '../session/sessionManager'

function getProfileId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

function getProfileIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))]
}

export function createProfileRouter(store: ProfileStore, sessions: SessionManager) {
  const router = Router()

  router.get(
    '/profiles',
    apiHandler(() =>
      store.list().map((profile) => {
        const session = sessions.getSession(profile.id)
        return {
          ...profile,
          status: sessions.getStatus(profile.id),
          remoteDebuggingPort: session?.remoteDebuggingPort ?? null,
          remoteDebuggingAddress: session?.remoteDebuggingAddress ?? null
        }
      })
    )
  )

  router.post(
    '/profiles',
    apiHandler((req) => store.create(req.body ?? {}))
  )

  router.put(
    '/profiles/:id',
    apiHandler((req) => store.update(getProfileId(req.params.id), req.body ?? {}))
  )

  router.post(
    '/profiles/batch-delete',
    apiHandler(async (req) => {
      const ids = getProfileIds(req.body?.ids)
      if (ids.length === 0) throw new Error('请选择要删除的环境')

      for (const id of ids) {
        await sessions.close(id)
        store.delete(id)
      }

      return { ids }
    })
  )

  router.delete(
    '/profiles/:id',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      await sessions.close(id)
      store.delete(id)
      return { id }
    })
  )

  router.post(
    '/profiles/:id/open',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      const profile = store.get(id)
      if (!profile) throw new Error('环境不存在')
      const session = await sessions.open(profile)
      store.touchOpened(profile.id)
      return {
        id: profile.id,
        status: session.status,
        remoteDebuggingPort: session.remoteDebuggingPort,
        remoteDebuggingAddress: session.remoteDebuggingAddress
      }
    })
  )

  router.post(
    '/profiles/:id/close',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      await sessions.close(id)
      return { id, status: sessions.getStatus(id) }
    })
  )

  router.get(
    '/sessions',
    apiHandler(() => sessions.list())
  )

  return router
}
