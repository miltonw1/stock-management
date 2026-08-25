import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { PaginatedProducts, ProductDto } from './dto/product.response.js';

@Injectable()
export class ProductsService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  async findAll(
    tenantId: number,
    query: QueryProductsDto,
  ): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const { search, categoryId, supplierId, locationId } = query;

    let filtered = this.db.orm.public.Product.where((p) =>
      p.tenantId.eq(tenantId),
    );
    if (search) {
      filtered = filtered.where((p) => p.name.ilike(`%${search}%`));
    }
    if (categoryId) {
      filtered = filtered.where((p) => p.categoryId.eq(categoryId));
    }
    if (supplierId) {
      filtered = filtered.where((p) => p.supplierId.eq(supplierId));
    }
    if (locationId) {
      filtered = filtered.where((p) => p.locationId.eq(locationId));
    }

    const { total } = await filtered.aggregate((agg) => ({
      total: agg.count(),
    }));
    const rows = await filtered
      .include('category', (c) => c.select('id', 'name'))
      .include('supplier', (s) => s.select('id', 'name'))
      .include('location', (l) => l.select('id', 'name', 'code'))
      .orderBy((p) => p.name.asc())
      .take(pageSize)
      .skip(skip)
      .all();

    const items: ProductDto[] = rows.map((p) => this.toProductDto(p));

    return { total, page, pageSize, items };
  }

  async findOne(tenantId: number, id: number): Promise<ProductDto> {
    const product = await this.db.orm.public.Product.where({ id, tenantId })
      .include('category', (c) => c.select('id', 'name'))
      .include('supplier', (s) => s.select('id', 'name'))
      .include('location', (l) => l.select('id', 'name', 'code'))
      .first();

    if (!product) {
      throw new NotFoundException();
    }
    return this.toProductDto(product);
  }

  async create(tenantId: number, dto: CreateProductDto) {
    await this.assertOwnedReferences(tenantId, dto);

    return this.db.orm.public.Product.create({
      name: dto.name,
      description: dto.description ?? null,
      stock: dto.stock ?? 0,
      minStock: dto.minStock ?? 0,
      price: dto.price,
      cost: dto.cost ?? null,
      unit: dto.unit ?? null,
      categoryId: dto.categoryId ?? null,
      supplierId: dto.supplierId ?? null,
      locationId: dto.locationId ?? null,
      tenantId,
    });
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    const product = await this.db.orm.public.Product.where({
      id,
      tenantId,
    }).first();
    if (!product) {
      throw new NotFoundException();
    }

    await this.assertOwnedReferences(tenantId, dto);

    return this.db.orm.public.Product.where({ id, tenantId }).update({
      name: dto.name ?? product.name,
      description:
        dto.description !== undefined ? dto.description : product.description,
      stock: dto.stock ?? product.stock,
      minStock: dto.minStock ?? product.minStock,
      price: dto.price ?? product.price,
      cost: dto.cost !== undefined ? dto.cost : product.cost,
      unit: dto.unit !== undefined ? dto.unit : product.unit,
      categoryId:
        dto.categoryId !== undefined ? dto.categoryId : product.categoryId,
      supplierId:
        dto.supplierId !== undefined ? dto.supplierId : product.supplierId,
      locationId:
        dto.locationId !== undefined ? dto.locationId : product.locationId,
    });
  }

  async remove(tenantId: number, id: number) {
    const product = await this.db.orm.public.Product.where({
      id,
      tenantId,
    }).first();
    if (!product) {
      throw new NotFoundException();
    }
    await this.db.orm.public.Product.where({ id, tenantId }).delete();
    return { id };
  }

  private toProductDto(p: {
    id: number;
    name: string;
    description: string | null;
    stock: number;
    minStock: number;
    price: string;
    cost: string | null;
    unit: string | null;
    category: { id: number; name: string } | null;
    supplier: { id: number; name: string } | null;
    location: { id: number; name: string; code: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProductDto {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      stock: p.stock,
      minStock: p.minStock,
      price: p.price,
      cost: p.cost,
      unit: p.unit,
      category: p.category,
      supplier: p.supplier,
      location: p.location,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private async assertOwnedReferences(
    tenantId: number,
    ids: { categoryId?: number; supplierId?: number; locationId?: number },
  ) {
    if (ids.categoryId) {
      const category = await this.db.orm.public.Category.where({
        id: ids.categoryId,
        tenantId,
      }).first();
      if (!category) {
        throw new BadRequestException('INVALID_CATEGORY');
      }
    }
    if (ids.supplierId) {
      const supplier = await this.db.orm.public.Supplier.where({
        id: ids.supplierId,
        tenantId,
      }).first();
      if (!supplier) {
        throw new BadRequestException('INVALID_SUPPLIER');
      }
    }
    if (ids.locationId) {
      const location = await this.db.orm.public.Location.where({
        id: ids.locationId,
        tenantId,
      }).first();
      if (!location) {
        throw new BadRequestException('INVALID_LOCATION');
      }
    }
  }
}
