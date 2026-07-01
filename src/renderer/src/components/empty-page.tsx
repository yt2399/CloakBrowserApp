import { Globe2 } from 'lucide-react'
import { useI18n } from '@/i18n'

export function EmptyPage() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border bg-card text-center">
      <span className="mb-4 inline-flex size-[54px] items-center justify-center rounded-xl bg-accent text-primary">
        <Globe2 className="size-6" />
      </span>
      <h3 className="text-lg font-semibold">{t('nav.proxy')}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('header.proxySubtitle')}
      </p>
    </div>
  )
}
