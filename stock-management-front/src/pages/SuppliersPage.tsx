import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useReadOnly } from '@/hooks/useBilling'
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from '@/lib/api'
import type { Supplier } from '@/types/api'

export function SuppliersPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const readOnly = useReadOnly()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['suppliers'] })

  const save = useMutation({
    mutationFn: async (values: {
      id?: number
      name: string
      phone?: string
      email?: string
    }) => {
      const payload = {
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
      }
      return values.id
        ? updateSupplier(values.id, { name: values.name, ...payload })
        : createSupplier({ name: values.name, ...payload })
    },
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      setName('')
      setPhone('')
      setEmail('')
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setPhone('')
    setEmail('')
    setDialogOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setName(supplier.name)
    setPhone(supplier.phone ?? '')
    setEmail(supplier.email ?? '')
    setDialogOpen(true)
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    save.mutate({ id: editing?.id, name, phone, email })
  }

  return (
    <div>
      <PageHeader title={t('suppliers.title')}>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('suppliers.create')}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('suppliers.name')}</TableHead>
              <TableHead>{t('suppliers.phone')}</TableHead>
              <TableHead>{t('suppliers.email')}</TableHead>
              <TableHead className="w-24 text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.phone ?? '—'}</TableCell>
                  <TableCell>{supplier.email ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(supplier)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(supplier)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('common.edit') : t('suppliers.create')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">{t('suppliers.name')}</Label>
                <Input
                  id="supplier-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">{t('suppliers.phone')}</Label>
                <Input
                  id="supplier-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">{t('suppliers.email')}</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('common.confirmDelete')}
        description={`${t('suppliers.name')}: ${deleteTarget?.name ?? ''}`}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        loading={remove.isPending}
      />
    </div>
  )
}
