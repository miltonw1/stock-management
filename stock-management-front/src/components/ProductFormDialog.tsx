import { useState } from 'react'
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
import type { Category, Location, Product, ProductInput, Supplier } from '@/types/api'

export interface ProductFormValues extends ProductInput {
  id?: number
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editing,
  categories,
  suppliers,
  locations,
  onSave,
  pending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Product | null
  categories: Category[]
  suppliers: Supplier[]
  locations: Location[]
  onSave: (values: ProductFormValues) => void
  pending: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(() => editing?.name ?? '')
  const [description, setDescription] = useState(() => editing?.description ?? '')
  const [stock, setStock] = useState(() => String(editing?.stock ?? 0))
  const [minStock, setMinStock] = useState(() => String(editing?.minStock ?? 0))
  const [price, setPrice] = useState(() => editing?.price ?? '')
  const [cost, setCost] = useState(() => editing?.cost ?? '')
  const [unit, setUnit] = useState(() => editing?.unit ?? '')
  const [categoryId, setCategoryId] = useState(() =>
    editing?.category?.id ? String(editing.category.id) : '',
  )
  const [supplierId, setSupplierId] = useState(() =>
    editing?.supplier?.id ? String(editing.supplier.id) : '',
  )
  const [locationId, setLocationId] = useState(() =>
    editing?.location?.id ? String(editing.location.id) : '',
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({
      id: editing?.id,
      name,
      description: description.trim() || undefined,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      price: price.trim(),
      cost: cost.trim() || undefined,
      unit: unit.trim() || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      locationId: locationId ? Number(locationId) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? t('common.edit') : t('products.create')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-name">{t('products.name')}</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-description">{t('products.description')}</Label>
              <Input
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">{t('products.price')}</Label>
              <Input
                id="product-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-cost">{t('products.cost')}</Label>
              <Input
                id="product-cost"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">{t('products.stock')}</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-min-stock">{t('products.minStock')}</Label>
              <Input
                id="product-min-stock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-unit">{t('products.unit')}</Label>
              <Input
                id="product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="uds, kg…"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('products.category')}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('products.none')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('products.supplier')}</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('products.none')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('products.location')}</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('products.none')} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name} ({l.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
