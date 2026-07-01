import { I18N_STORAGE_KEY } from './i18n'
import type {
  ApiResponse,
  BrowserProfile,
  ProfileInput,
  ProxyInput,
  SavedProxy
} from './types'

const fallbackBaseUrl = 'http://127.0.0.1:6788/api'

function getBaseUrl(): string {
  return window.appInfo?.apiBaseUrl || fallbackBaseUrl
}

function requestFailedMessage(): string {
  return localStorage.getItem(I18N_STORAGE_KEY) === 'en' ? 'Request failed' : '请求失败'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  })
  const body = (await response.json()) as ApiResponse<T>
  if (!response.ok || !body.succeed) {
    throw new Error(body.msg || requestFailedMessage())
  }
  return body.data
}

export const profileApi = {
  list() {
    return request<BrowserProfile[]>('/profiles')
  },
  create(input: ProfileInput) {
    return request<BrowserProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },
  update(id: string, input: ProfileInput) {
    return request<BrowserProfile>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    })
  },
  remove(id: string) {
    return request<{ id: string }>(`/profiles/${id}`, { method: 'DELETE' })
  },
  batchDelete(ids: string[]) {
    return request<{ ids: string[] }>('/profiles/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  },
  open(id: string) {
    return request<{ id: string; status: string }>(`/profiles/${id}/open`, { method: 'POST' })
  },
  close(id: string) {
    return request<{ id: string; status: string }>(`/profiles/${id}/close`, { method: 'POST' })
  },
  health() {
    return request<{ service: string; kernel: string }>('/health')
  }
}

export const proxyApi = {
  list() {
    return request<SavedProxy[]>('/proxies')
  },
  create(input: ProxyInput) {
    return request<SavedProxy>('/proxies', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },
  update(id: string, input: ProxyInput) {
    return request<SavedProxy>(`/proxies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    })
  },
  remove(id: string) {
    return request<{ id: string }>(`/proxies/${id}`, { method: 'DELETE' })
  }
}
