export interface CategoryRef {
  id: number;
  name: string;
}

export interface SupplierRef {
  id: number;
  name: string;
}

export interface LocationRef {
  id: number;
  name: string;
  code: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string | null;
  stock: number;
  minStock: number;
  price: string;
  cost: string | null;
  unit: string | null;
  category: CategoryRef | null;
  supplier: SupplierRef | null;
  location: LocationRef | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProducts {
  total: number;
  page: number;
  pageSize: number;
  items: ProductDto[];
}
