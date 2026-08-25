export interface SaleDto {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
  createdAt: Date;
}

export interface PaginatedSales {
  total: number;
  page: number;
  pageSize: number;
  items: SaleDto[];
}
