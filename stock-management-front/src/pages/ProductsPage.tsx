import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SaleDialog } from '@/components/SaleDialog'
import {
  ProductFormDialog,
  type ProductFormValues,
} from '@/components/ProductFormDialog'
import { useReadOnly } from '@/hooks/useBilling'
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchLocations,
  fetchProducts,
  fetchSuppliers,
  updateProduct,
} from '@/lib/api'
import type { Product } from '@/types/api'

const PAGE_SIZE = 20

interface Filters {
  search: string
  categoryId?: number
  supplierId?: number
  locationId?: number
  page: number
}

export function ProductsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const readOnly = useReadOnly()
  const [filters, setFilters] = useState<Filters>({ search: '', page: 1 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [saleOpen, setSaleOpen] = useState(false)
  const [saleProductId, setSaleProductId] = useState<number | undefined>(undefined)

  const categories = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: fetchSuppliers })
  const locations = useQuery({ queryKey: ['locations'], queryFn: fetchLocations })

  const products = useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      fetchProducts({
        search: filters.search || undefined,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
        locationId: filters.locationId,
        page: filters.page,
        pageSize: PAGE_SIZE,
      }),
  })

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['products'], refetchType: 'all' })

  const save = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const { id, ...rest } = values
      return id ? updateProduct(id, rest) : createProduct(rest)
    },
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  const total = products.data?.total ?? 0
  const page = filters.page
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function openCreate() {
    setEditing(null)
    setFormKey((k) => k + 1)
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setFormKey((k) => k + 1)
    setDialogOpen(true)
  }

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div>
      <PageHeader title={t('products.title')}>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('products.create')}
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t('common.search')}
            className="w-64 pl-8"
          />
        </div>
        <Select
          value={filters.categoryId ? String(filters.categoryId) : 'all'}
          onValueChange={(v) => setFilter('categoryId', v === 'all' ? undefined : Number(v))}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {categories.data?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.supplierId ? String(filters.supplierId) : 'all'}
          onValueChange={(v) => setFilter('supplierId', v === 'all' ? undefined : Number(v))}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {suppliers.data?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.locationId ? String(filters.locationId) : 'all'}
          onValueChange={(v) => setFilter('locationId', v === 'all' ? undefined : Number(v))}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {locations.data?.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.name')}</TableHead>
              <TableHead>{t('products.category')}</TableHead>
              <TableHead>{t('products.supplier')}</TableHead>
              <TableHead>{t('products.location')}</TableHead>
              <TableHead className="text-right">{t('products.stock')}</TableHead>
              <TableHead className="text-right">{t('products.price')}</TableHead>
              <TableHead className="w-24 text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : (products.data?.items.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              products.data?.items.map((product) => {
                const lowStock = product.stock <= product.minStock
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name ?? '—'}</TableCell>
                    <TableCell>{product.supplier?.name ?? '—'}</TableCell>
                    <TableCell>{product.location?.name ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {lowStock ? (
                        <Badge variant="destructive">{product.stock}</Badge>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell className="text-right">{product.price}</TableCell>
                    <TableCell className="text-right">
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={t('sales.create')}
                          onClick={() => {
                            setSaleProductId(product.id)
                            setSaleOpen(true)
                          }}
                        >
                          <ShoppingCart className="size-4" />
                        </Button>
                      )}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                      {readOnly && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} · {totalPages} {t('products.title').toLowerCase()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setFilter('page', page - 1)}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setFilter('page', page + 1)}
          >
            →
          </Button>
        </div>
      </div>

      <ProductFormDialog
        key={formKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categories.data ?? []}
        suppliers={suppliers.data ?? []}
        locations={locations.data ?? []}
        onSave={(values) => save.mutate(values)}
        pending={save.isPending}
      />

      <SaleDialog
        open={saleOpen}
        onOpenChange={setSaleOpen}
        products={products.data?.items ?? []}
        defaultProductId={saleProductId}
        disabled={readOnly}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('common.confirmDelete')}
        description={`${t('products.name')}: ${deleteTarget?.name ?? ''}`}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        loading={remove.isPending}
      />
    </div>
  )
}
