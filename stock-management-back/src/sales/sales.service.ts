import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service.js';
import { multiplyDecimal } from '../common/money.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { QuerySalesDto } from './dto/query-sales.dto.js';
import type { PaginatedSales, SaleDto } from './dto/sale.response.js';

@Injectable()
export class SalesService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  async create(tenantId: number, dto: CreateSaleDto): Promise<SaleDto> {
    const product = await this.db.orm.public.Product.where({
      id: dto.productId,
      tenantId,
    }).first();

    if (!product) {
      throw new NotFoundException();
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('STOCK_INSUFFICIENT');
    }

    const total = multiplyDecimal(product.price, dto.quantity);

    const sale = await this.db.transaction(async (tx) => {
      await tx.orm.public.Product.where({ id: product.id, tenantId }).update({
        stock: product.stock - dto.quantity,
      });

      return tx.orm.public.Sale.create({
        tenantId,
        productId: product.id,
        productName: product.name,
        quantity: dto.quantity,
        unitPrice: product.price,
        total,
      });
    });

    return this.toSaleDto(sale);
  }

  async findAll(
    tenantId: number,
    query: QuerySalesDto,
  ): Promise<PaginatedSales> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const { total } = await this.db.orm.public.Sale.where((s) =>
      s.tenantId.eq(tenantId),
    ).aggregate((agg) => ({ total: agg.count() }));

    const rows = await this.db.orm.public.Sale.select(
      'id',
      'productId',
      'productName',
      'quantity',
      'unitPrice',
      'total',
      'createdAt',
    )
      .where((s) => s.tenantId.eq(tenantId))
      .orderBy((s) => s.createdAt.desc())
      .take(pageSize)
      .skip(skip)
      .all();

    return { total, page, pageSize, items: rows.map((r) => this.toSaleDto(r)) };
  }

  private toSaleDto(sale: {
    id: number;
    productId: number | null;
    productName: string;
    quantity: number;
    unitPrice: string;
    total: string;
    createdAt: Date;
  }): SaleDto {
    return {
      id: sale.id,
      productId: sale.productId,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      total: sale.total,
      createdAt: sale.createdAt,
    };
  }
}
