export type UserRole = 'owner' | 'admin' | 'employee'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export interface Tenant {
  id: number
  name: string
  slug: string
}

export interface AuthResponse {
  accessToken: string
  user: User
  tenant: Tenant
}

export interface RegisterDto {
  tenantName: string
  name: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface Category {
  id: number
  name: string
  tenantId: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: number
  name: string
  phone: string | null
  email: string | null
  tenantId: number
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: number
  name: string
  code: string
  tenantId: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: string
  description: string | null
  stock: number
  minStock: number
  price: string
  cost: string | null
  unit: string | null
  category: { id: number; name: string } | null
  supplier: { id: number; name: string } | null
  location: { id: number; name: string; code: string } | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedProducts {
  total: number
  page: number
  pageSize: number
  items: Product[]
}

export interface ProductsQuery {
  search?: string
  categoryId?: number
  supplierId?: number
  locationId?: number
  page?: number
  pageSize?: number
}

export interface ProductInput {
  name: string
  description?: string
  stock?: number
  minStock?: number
  price: string
  cost?: string
  unit?: string
  categoryId?: number
  supplierId?: number
  locationId?: number
}

export interface BillingPackage {
  id: string
  label: string
  days: number
  price: number
}

export interface BillingStatus {
  expiresAt: string
  active: boolean
  readOnly: boolean
  packages: BillingPackage[]
}

export interface CheckoutResult {
  orderId: number
  initPoint: string | undefined
  package: BillingPackage
}

export interface Sale {
  id: number
  productId: number | null
  productName: string
  quantity: number
  unitPrice: string
  total: string
  createdAt: string
}

export interface PaginatedSales {
  total: number
  page: number
  pageSize: number
  items: Sale[]
}

export interface SalesQuery {
  page?: number
  pageSize?: number
}
