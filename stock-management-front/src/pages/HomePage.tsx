import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Boxes, Layers, MapPin, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/auth'
import {
  fetchCategories,
  fetchLocations,
  fetchProducts,
  fetchSuppliers,
} from '@/lib/api'

export function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const products = useQuery({
    queryKey: ['products', 'summary'],
    queryFn: () => fetchProducts({ pageSize: 1 }),
  })
  const categories = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: fetchSuppliers })
  const locations = useQuery({ queryKey: ['locations'], queryFn: fetchLocations })

  const stats = [
    { label: t('home.products'), value: products.data?.total, icon: Boxes },
    { label: t('home.categories'), value: categories.data?.length, icon: Layers },
    { label: t('home.suppliers'), value: suppliers.data?.length, icon: Truck },
    { label: t('home.locations'), value: locations.data?.length, icon: MapPin },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t('nav.home')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('home.welcome', { name: user?.name })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value === undefined ? '…' : item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
