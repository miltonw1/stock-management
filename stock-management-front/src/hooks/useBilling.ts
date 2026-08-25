import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth'
import { getBillingStatus } from '@/lib/api'

export function useBillingStatus() {
  const { isAuthenticated } = useAuth()
  const query = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: getBillingStatus,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
  const readOnly = query.data?.readOnly ?? false
  return { ...query, readOnly }
}

export function useReadOnly() {
  return useBillingStatus().readOnly
}
