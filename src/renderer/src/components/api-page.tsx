import { useState } from 'react'
import {
  BookOpen,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe2,
  Heart,
  Layers,
  Terminal
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  titleKey: string
  descKey: string
  body?: string
  example?: string
}

const profileEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/profiles',
    titleKey: 'api.getList',
    descKey: 'api.getListDesc',
    example: `curl http://127.0.0.1:6788/api/profiles`
  },
  {
    method: 'POST',
    path: '/api/profiles',
    titleKey: 'api.createProfile',
    descKey: 'api.createProfileDesc',
    body: `{
  "name": "新环境",
  "startUrl": "https://example.com"
}`,
    example: `curl -X POST http://127.0.0.1:6788/api/profiles \\
  -H "Content-Type: application/json" \\
  -d '{"name": "新环境"}'`
  },
  {
    method: 'PUT',
    path: '/api/profiles/:id',
    titleKey: 'api.updateProfile',
    descKey: 'api.updateProfileDesc',
    body: `{
  "name": "更新后的名称",
  "startUrl": "https://example.com"
}`,
    example: `curl -X PUT http://127.0.0.1:6788/api/profiles/abc123 \\
  -H "Content-Type: application/json" \\
  -d '{"name": "更新后的名称"}'`
  },
  {
    method: 'DELETE',
    path: '/api/profiles/:id',
    titleKey: 'api.deleteProfile',
    descKey: 'api.deleteProfileDesc',
    example: `curl -X DELETE http://127.0.0.1:6788/api/profiles/abc123`
  },
  {
    method: 'POST',
    path: '/api/profiles/batch-delete',
    titleKey: 'api.batchDelete',
    descKey: 'api.batchDeleteDesc',
    body: `{
  "ids": ["abc123", "def456"]
}`,
    example: `curl -X POST http://127.0.0.1:6788/api/profiles/batch-delete \\
  -H "Content-Type: application/json" \\
  -d '{"ids": ["abc123", "def456"]}'`
  },
  {
    method: 'POST',
    path: '/api/profiles/:id/open',
    titleKey: 'api.startProfile',
    descKey: 'api.startProfileDesc',
    example: `curl -X POST http://127.0.0.1:6788/api/profiles/abc123/open`
  },
  {
    method: 'POST',
    path: '/api/profiles/:id/close',
    titleKey: 'api.stopProfile',
    descKey: 'api.stopProfileDesc',
    example: `curl -X POST http://127.0.0.1:6788/api/profiles/abc123/close`
  },
  {
    method: 'GET',
    path: '/api/sessions',
    titleKey: 'api.getSessions',
    descKey: 'api.getSessionsDesc',
    example: `curl http://127.0.0.1:6788/api/sessions`
  }
]

const proxyEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/proxies',
    titleKey: 'api.getProxies',
    descKey: 'api.getProxiesDesc',
    example: `curl http://127.0.0.1:6788/api/proxies`
  },
  {
    method: 'POST',
    path: '/api/proxies',
    titleKey: 'api.createProxy',
    descKey: 'api.createProxyDesc',
    body: `{
  "name": "日本代理",
  "protocol": "socks5",
  "host": "proxy.example.com",
  "port": 1080,
  "username": "",
  "password": ""
}`,
    example: `curl -X POST http://127.0.0.1:6788/api/proxies \\
  -H "Content-Type: application/json" \\
  -d '{"name":"日本代理","protocol":"socks5","host":"proxy.example.com","port":1080}'`
  },
  {
    method: 'PUT',
    path: '/api/proxies/:id',
    titleKey: 'api.updateProxy',
    descKey: 'api.updateProxyDesc',
    body: `{
  "name": "更新后的代理"
}`,
    example: `curl -X PUT http://127.0.0.1:6788/api/proxies/xyz789 \\
  -H "Content-Type: application/json" \\
  -d '{"name": "更新后的代理"}'`
  },
  {
    method: 'DELETE',
    path: '/api/proxies/:id',
    titleKey: 'api.deleteProxy',
    descKey: 'api.deleteProxyDesc',
    example: `curl -X DELETE http://127.0.0.1:6788/api/proxies/xyz789`
  }
]

const healthEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/health',
    titleKey: 'api.health',
    descKey: 'api.healthDesc',
    example: `curl http://127.0.0.1:6788/api/health`
  }
]

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700'
  }
  return (
    <Badge variant="secondary" className={`font-mono text-[11px] font-semibold ${colors[method] || ''}`}>
      {method}
    </Badge>
  )
}

function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('api.copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('toast.copyFailed'))
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 font-mono text-sm text-foreground">{endpoint.path}</code>
        <span className="text-sm text-muted-foreground">{t(endpoint.titleKey as any)}</span>
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3">
          <p className="text-sm text-muted-foreground">{t(endpoint.descKey as any)}</p>

          {endpoint.body && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t('api.body')}</p>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
                {endpoint.body}
              </pre>
            </div>
          )}

          {endpoint.example && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{t('api.example')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => copyToClipboard(endpoint.example!)}
                >
                  {copied ? (
                    <CheckCircle2 className="mr-1 size-3 text-emerald-500" />
                  ) : (
                    <Copy className="mr-1 size-3" />
                  )}
                  {copied ? t('api.copied') : t('common.copy')}
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
                {endpoint.example}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EndpointSection({
  icon,
  titleKey,
  descKey,
  endpoints
}: {
  icon: React.ReactNode
  titleKey: string
  descKey: string
  endpoints: ApiEndpoint[]
}) {
  const { t } = useI18n()

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{t(titleKey as any)}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(descKey as any)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {endpoints.map((endpoint) => (
          <ApiEndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
        ))}
      </div>
    </article>
  )
}

export function ApiPage() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('api.copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('toast.copyFailed'))
    }
  }

  return (
    <div className="max-w-[900px] space-y-4">
      <article className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Terminal className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{t('api.baseUrl')}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('api.baseUrlDesc')}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/30 px-3.5 py-3">
          <code className="flex-1 font-mono text-sm text-foreground">http://127.0.0.1:6788</code>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => copyToClipboard('http://127.0.0.1:6788')}
          >
            {copied ? (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </article>

      <article className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <BookOpen className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{t('api.responseFormat')}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('api.responseFormatDesc')}</p>
          </div>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
{`{
  "code": 200,
  "msg": "success",
  "data": { ... },
  "succeed": true,
  "timestamp": 1700000000000
}`}
        </pre>
      </article>

      <EndpointSection
        icon={<Layers className="size-5" />}
        titleKey="api.profiles"
        descKey="api.profilesDesc"
        endpoints={profileEndpoints}
      />

      <EndpointSection
        icon={<Globe2 className="size-5" />}
        titleKey="api.proxy"
        descKey="api.proxyDesc"
        endpoints={proxyEndpoints}
      />

      <EndpointSection
        icon={<Heart className="size-5" />}
        titleKey="api.health"
        descKey="api.healthDesc"
        endpoints={healthEndpoints}
      />
    </div>
  )
}
