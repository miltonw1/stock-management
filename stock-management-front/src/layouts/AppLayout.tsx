import { NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Boxes,
  CreditCard,
  Home,
  Layers,
  MapPin,
  Package,
  ReceiptText,
  Truck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/auth'
import { setLanguage } from '@/lib/i18n'
import { useBillingStatus } from '@/hooks/useBilling'
import type { UserRole } from '@/types/api'

const allRoles: UserRole[] = ['owner', 'admin', 'employee']
const navItems = [
  { to: '/', label: 'nav.home', icon: Home, roles: allRoles },
  { to: '/products', label: 'nav.products', icon: Boxes, roles: allRoles },
  { to: '/categories', label: 'nav.categories', icon: Layers, roles: allRoles },
  { to: '/suppliers', label: 'nav.suppliers', icon: Truck, roles: allRoles },
  { to: '/locations', label: 'nav.locations', icon: MapPin, roles: allRoles },
  { to: '/sales', label: 'nav.sales', icon: ReceiptText, roles: allRoles },
  { to: '/billing', label: 'nav.billing', icon: CreditCard, roles: allRoles },
  { to: '/users', label: 'nav.users', icon: Users, roles: ['owner', 'admin'] as UserRole[] },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {i18n.language === 'en' ? 'EN' : 'ES'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void setLanguage('es')}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setLanguage('en')}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const { user, tenant, logout } = useAuth()
  const { data, readOnly } = useBillingStatus()

  const expiresAt = data ? new Date(data.expiresAt) : null
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
    : 0
  const isUrgent = daysRemaining < 14

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Package className="size-5 text-primary" />
          <span className="ml-2 font-semibold">{t('app.title')}</span>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems
            .filter((item) => item.roles.includes(user?.role ?? 'employee'))
            .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`
              }
            >
              <item.icon className="size-4" />
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">{t('auth.tenantLabel')}</p>
          <p className="truncate font-medium">{tenant?.name}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b px-4">
          {data && (
            <NavLink
              to="/billing"
              className={isUrgent ? 'text-sm font-medium text-destructive' : 'text-sm font-medium text-green-600'}
            >
              {t('billing.daysLeftHeader', { days: daysRemaining })}
            </NavLink>
          )}
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {user?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.email}
                <span className="block text-xs font-normal text-muted-foreground">
                  {t(`roles.${user?.role}`)}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>{t('auth.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6">
          {readOnly && (
            <div className="mb-6 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">
                {t('readOnly.banner')}
              </p>
              <Button asChild size="sm" variant="outline">
                <NavLink to="/billing">{t('readOnly.payNow')}</NavLink>
              </Button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
