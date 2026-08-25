import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { LoginDto, RegisterDto, Tenant, User } from '@/types/api'
import * as api from '@/lib/api'

interface AuthContextValue {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStored<User>('auth_user'))
  const [tenant, setTenant] = useState<Tenant | null>(() =>
    readStored<Tenant>('auth_tenant'),
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenant,
      isAuthenticated: !!user,
      async login(dto) {
        const session = await api.login(dto)
        api.setAccessToken(session.accessToken)
        localStorage.setItem('auth_user', JSON.stringify(session.user))
        localStorage.setItem('auth_tenant', JSON.stringify(session.tenant))
        setUser(session.user)
        setTenant(session.tenant)
      },
      async register(dto) {
        const session = await api.register(dto)
        api.setAccessToken(session.accessToken)
        localStorage.setItem('auth_user', JSON.stringify(session.user))
        localStorage.setItem('auth_tenant', JSON.stringify(session.tenant))
        setUser(session.user)
        setTenant(session.tenant)
      },
      logout() {
        localStorage.removeItem('access_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
        setUser(null)
        setTenant(null)
      },
    }),
    [user, tenant],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
