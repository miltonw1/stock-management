import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { useBillingStatus } from '@/hooks/useBilling'
import { createCheckout } from '@/lib/api'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export function SubscriptionPage() {
  const { t } = useTranslation()
  const { data, readOnly } = useBillingStatus()
  const [now] = useState(() => Date.now())

  const checkout = useMutation({
    mutationFn: (packageId: string) => createCheckout(packageId),
    onSuccess: (result) => {
      if (result.initPoint) {
        window.location.href = result.initPoint
      }
    },
  })

  const expiresAt = data ? new Date(data.expiresAt) : null
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 86_400_000))
    : 0

  return (
    <div>
      <PageHeader title={t('billing.title')} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('billing.status')}
            {data && (
              <Badge variant={data.active ? 'default' : 'destructive'}>
                {data.active ? t('billing.active') : t('billing.expired')}
              </Badge>
            )}
          </CardTitle>
          {expiresAt && (
            <CardDescription>
              {t('billing.daysRemaining')}: <strong>{daysRemaining}</strong> ·{' '}
              {t('billing.expiresAt')}{' '}
              {expiresAt.toLocaleString('es-AR', { dateStyle: 'long' })}
            </CardDescription>
          )}
          {readOnly && (
            <CardDescription className="text-destructive">
              {t('readOnly.banner')}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <h2 className="mb-3 text-lg font-medium">{t('billing.selectPackage')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.packages ?? []).map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle>{pkg.label}</CardTitle>
              <CardDescription>
                {pkg.days} {t('billing.days')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
              <Button
                onClick={() => checkout.mutate(pkg.id)}
                disabled={checkout.isPending}
              >
                {t('billing.pay')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {checkout.isError && (
        <p className="mt-4 text-sm font-medium text-destructive">{t('common.error')}</p>
      )}
    </div>
  )
}
