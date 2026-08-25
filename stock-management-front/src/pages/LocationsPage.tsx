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
  createLocation,
  deleteLocation,
  fetchLocations,
  updateLocation,
} from '@/lib/api'
import type { Location } from '@/types/api'

export function LocationsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const readOnly = useReadOnly()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['locations'] })

  const save = useMutation({
    mutationFn: async (values: { id?: number; name: string; code: string }) =>
      values.id
        ? updateLocation(values.id, { name: values.name, code: values.code })
        : createLocation({ name: values.name, code: values.code }),
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      setName('')
      setCode('')
      setError(null)
    },
    onError: (err) =>
      setError(resolveApiError(err, t, { CODE_IN_USE: 'locations.duplicateCode' })),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setCode('')
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(location: Location) {
    setEditing(location)
    setName(location.name)
    setCode(location.code)
    setError(null)
    setDialogOpen(true)
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    save.mutate({ id: editing?.id, name, code })
  }

  return (
    <div>
      <PageHeader title={t('locations.title')}>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('locations.create')}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('locations.name')}</TableHead>
              <TableHead>{t('locations.code')}</TableHead>
              <TableHead className="w-24 text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.code}</TableCell>
                  <TableCell className="text-right">
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(location)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(location)}
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
              {editing ? t('common.edit') : t('locations.create')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location-name">{t('locations.name')}</Label>
                <Input
                  id="location-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-code">{t('locations.code')}</Label>
                <Input
                  id="location-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError(null)
                  }}
                  required
                  minLength={1}
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
        description={`${t('locations.name')}: ${deleteTarget?.name ?? ''}`}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        loading={remove.isPending}
      />
    </div>
  )
}
