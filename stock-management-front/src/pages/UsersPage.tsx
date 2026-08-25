import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/auth'
import { useReadOnly } from '@/hooks/useBilling'
import { createUser, fetchUsers } from '@/lib/api'
import type { User } from '@/types/api'

export function UsersPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { user: currentUser } = useAuth()
  const readOnly = useReadOnly()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')

  const canManage =
    (currentUser?.role === 'owner' || currentUser?.role === 'admin') && !readOnly

  const { data = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })

  const create = useMutation({
    mutationFn: (values: { name: string; email: string; password: string; role: 'admin' | 'employee' }) =>
      createUser(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setDialogOpen(false)
      setName('')
      setEmail('')
      setPassword('')
      setRole('employee')
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    create.mutate({ name, email, password, role: role as 'admin' | 'employee' })
  }

  return (
    <div>
      <PageHeader title={t('users.title')}>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t('users.create')}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('auth.name')}</TableHead>
              <TableHead>{t('auth.email')}</TableHead>
              <TableHead>{t('users.role')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((u: User) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{t(`roles.${u.role}`)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('users.create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">{t('auth.name')}</Label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">{t('auth.email')}</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">{t('auth.password')}</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('users.role')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="employee">{t('roles.employee')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
