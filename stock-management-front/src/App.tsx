import { Navigate, Outlet, Route, Routes } from 'react-router'
import { useAuth } from './context/auth'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProductsPage } from './pages/ProductsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { LocationsPage } from './pages/LocationsPage'
import { UsersPage } from './pages/UsersPage'
import { SalesPage } from './pages/SalesPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { BillingReturnPage } from './pages/BillingReturnPage'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/billing" element={<SubscriptionPage />} />
          <Route path="/billing/success" element={<BillingReturnPage mode="success" />} />
          <Route path="/billing/failure" element={<BillingReturnPage mode="failure" />} />
          <Route path="/billing/pending" element={<BillingReturnPage mode="pending" />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
