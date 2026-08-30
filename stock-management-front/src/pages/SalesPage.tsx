import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { SaleDialog } from '@/components/SaleDialog'
import { useReadOnly } from '@/hooks/useBilling'
import { fetchProducts, fetchSales } from '@/lib/api'

export function SalesPage() {
  const { t } = useTranslation()
  const readOnly = useReadOnly()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const products = useQuery({ queryKey: ['products', 'sale'], queryFn: () => fetchProducts({ pageSize: 200 }) })
  const sales = useQuery({ queryKey: ['sales'], queryFn: () => fetchSales({ page: 1, pageSize: 50 }) })

  const items = sales.data?.items ?? []

  return (
    <div>
      <PageHeader title={t('sales.title')}>
        {!readOnly && (
          <Button
            onClick={() => {
              setDialogKey((k) => k + 1)
              setDialogOpen(true)
            }}
            disabled={!products.data?.items?.length}
          >
            <Plus className="size-4" />
            {t('sales.create')}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('sales.date')}</TableHead>
              <TableHead>{t('sales.product')}</TableHead>
              <TableHead className="text-right">{t('sales.quantity')}</TableHead>
              <TableHead className="text-right">{t('sales.unitPrice')}</TableHead>
              <TableHead className="text-right">{t('sales.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{sale.productName}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">{sale.unitPrice}</TableCell>
                  <TableCell className="text-right">{sale.total}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SaleDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products.data?.items ?? []}
        disabled={readOnly}
      />
    </div>
  )
}
