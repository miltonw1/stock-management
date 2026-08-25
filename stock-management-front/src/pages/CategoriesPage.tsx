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
import { resolveApiError } from '@/lib/errors'
import { useReadOnly } from '@/hooks/useBilling'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/lib/api'
import type { Category } from '@/types/api'

export function CategoriesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const readOnly = useReadOnly()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] })

  const save = useMutation({
    mutationFn: async (values: { id?: number; name: string }) =>
      values.id ? updateCategory(values.id, values.name) : createCategory(values.name),
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      setName('')
      setError(null)
    },
    onError: (err) =>
      setError(resolveApiError(err, t, { NAME_IN_USE: 'categories.duplicateName' })),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setName(category.name)
    setError(null)
    setDialogOpen(true)
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    save.mutate({ id: editing?.id, name })
  }

  return (
    <div>
      <PageHeader title={t('categories.title')}>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('categories.create')}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('categories.name')}</TableHead>
              <TableHead className="w-24 text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(category)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(category)}
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
              {editing ? t('common.edit') : t('categories.create')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="category-name">{t('categories.name')}</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                required
                minLength={2}
              />
            </div>
            {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
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
        description={`${t('categories.name')}: ${deleteTarget?.name ?? ''}`}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        loading={remove.isPending}
      />
    </div>
  )
}
