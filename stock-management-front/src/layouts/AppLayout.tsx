import { NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Boxes,
  Home,
  Layers,
  MapPin,
  Package,
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
import type { UserRole } from '@/types/api'

const allRoles: UserRole[] = ['owner', 'admin', 'employee']
const navItems = [
  { to: '/', label: 'nav.home', icon: Home, roles: allRoles },
  { to: '/products', label: 'nav.products', icon: Boxes, roles: allRoles },
  { to: '/categories', label: 'nav.categories', icon: Layers, roles: allRoles },
  { to: '/suppliers', label: 'nav.suppliers', icon: Truck, roles: allRoles },
  { to: '/locations', label: 'nav.locations', icon: MapPin, roles: allRoles },
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
