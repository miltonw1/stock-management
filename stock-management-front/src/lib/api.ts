import axios from 'axios'
import type {
  AuthResponse,
  Category,
  Location,
  LoginDto,
  PaginatedProducts,
  Product,
  ProductInput,
  ProductsQuery,
  RegisterDto,
  Supplier,
  Tenant,
  User,
  UserRole,
} from '@/types/api'

const TOKEN_KEY = 'access_token'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_tenant')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export interface AuthSession {
  accessToken: string
  user: User
  tenant: Tenant
}

export async function register(dto: RegisterDto): Promise<AuthSession> {
  const { data } = await api.post<AuthResponse>('/auth/register', dto)
  return data
}

export async function login(dto: LoginDto): Promise<AuthSession> {
  const { data } = await api.post<AuthResponse>('/auth/login', dto)
  return data
}

export async function fetchMe(): Promise<{ user: User; tenant: Tenant }> {
  const { data } = await api.get<{ user: User; tenant: Tenant }>('/auth/me')
  return data
}

export async function createUser(dto: {
  name: string
  email: string
  password: string
  role: 'admin' | 'employee'
}): Promise<User> {
  const { data } = await api.post<User>('/users', dto)
  return data
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<Category>('/categories', { name })
  return data
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, { name })
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>('/suppliers')
  return data
}

export async function createSupplier(dto: {
  name: string
  phone?: string
  email?: string
}): Promise<Supplier> {
  const { data } = await api.post<Supplier>('/suppliers', dto)
  return data
}

export async function updateSupplier(
  id: number,
  dto: { name?: string; phone?: string; email?: string },
): Promise<Supplier> {
  const { data } = await api.patch<Supplier>(`/suppliers/${id}`, dto)
  return data
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/suppliers/${id}`)
}

export async function fetchLocations(): Promise<Location[]> {
  const { data } = await api.get<Location[]>('/locations')
  return data
}

export async function createLocation(dto: {
  name: string
  code: string
}): Promise<Location> {
  const { data } = await api.post<Location>('/locations', dto)
  return data
}

export async function updateLocation(
  id: number,
  dto: { name?: string; code?: string },
): Promise<Location> {
  const { data } = await api.patch<Location>(`/locations/${id}`, dto)
  return data
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/locations/${id}`)
}

export async function fetchProducts(
  query: ProductsQuery = {},
): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params: query })
  return data
}

export async function createProduct(dto: ProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/products', dto)
  return data
}

export async function updateProduct(
  id: number,
  dto: Partial<ProductInput>,
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, dto)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}

export type { UserRole }
