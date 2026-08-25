import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../prisma/db.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

@Injectable()
export class SuppliersService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  findAll(tenantId: number) {
    return this.db.orm.public.Supplier.where((s) => s.tenantId.eq(tenantId))
      .orderBy((s) => s.name.asc())
      .all();
  }

  create(tenantId: number, dto: CreateSupplierDto) {
    return this.db.orm.public.Supplier.create({
      name: dto.name,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      tenantId,
    });
  }

  async update(tenantId: number, id: number, dto: UpdateSupplierDto) {
    const supplier = await this.db.orm.public.Supplier.where({
      id,
      tenantId,
    }).first();
    if (!supplier) {
      throw new NotFoundException();
    }

    return this.db.orm.public.Supplier.where({ id, tenantId }).update({
      name: dto.name ?? supplier.name,
      phone: dto.phone !== undefined ? dto.phone : supplier.phone,
      email: dto.email !== undefined ? dto.email : supplier.email,
    });
  }

  async remove(tenantId: number, id: number) {
    const supplier = await this.db.orm.public.Supplier.where({
      id,
      tenantId,
    }).first();
    if (!supplier) {
      throw new NotFoundException();
    }
    await this.db.orm.public.Supplier.where({ id, tenantId }).delete();
    return { id };
  }
}
