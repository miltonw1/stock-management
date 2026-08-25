import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { queryClient } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export type BillingReturnMode = 'success' | 'failure' | 'pending'

function modeToTitle(mode: BillingReturnMode) {
  return {
    success: 'billing.successTitle',
    failure: 'billing.failureTitle',
    pending: 'billing.pendingTitle',
  }[mode]
}

export function BillingReturnPage({ mode }: { mode: BillingReturnMode }) {
  const { t } = useTranslation()
  void queryClient.invalidateQueries({ queryKey: ['billing'] })

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>{t(modeToTitle(mode))}</CardTitle>
          <CardDescription>
            {mode === 'success' ? t('billing.successText') : t('billing.failureText')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/billing">{t('billing.back')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
