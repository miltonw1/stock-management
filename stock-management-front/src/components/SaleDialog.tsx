import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSale } from '@/lib/api'
import { multiplyDecimal } from '@/lib/money'
import type { Product } from '@/types/api'

export function SaleDialog({
  open,
  onOpenChange,
  products,
  defaultProductId,
  disabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  defaultProductId?: number
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [productId, setProductId] = useState(
    () => String(defaultProductId ?? products[0]?.id ?? ''),
  )
  const [quantity, setQuantity] = useState('1')

  const selected = products.find((p) => String(p.id) === productId)
  const total = selected ? multiplyDecimal(selected.price, Number(quantity) || 0) : ''

  const sale = useMutation({
    mutationFn: () =>
      createSale({ productId: Number(productId), quantity: Number(quantity) || 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      onOpenChange(false)
      setQuantity('1')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sales.create')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('sales.product')}</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.empty')} />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} · {p.stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-qty">{t('sales.quantity')}</Label>
            <Input
              id="sale-qty"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          {selected && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('sales.unitPrice')}: {selected.price}
              </span>
              <span className="font-medium">
                {t('sales.total')}: {total}
              </span>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => sale.mutate()}
            disabled={disabled || sale.isPending || !productId || !selected}
          >
            {t('sales.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
