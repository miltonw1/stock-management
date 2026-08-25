import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  findAll(tenantId: number) {
    return this.db.orm.public.Category.where((c) => c.tenantId.eq(tenantId))
      .orderBy((c) => c.name.asc())
      .all();
  }

  async create(tenantId: number, dto: CreateCategoryDto) {
    const existing = await this.db.orm.public.Category.where({
      tenantId,
      name: dto.name,
    }).first();
    if (existing) {
      throw new ConflictException('NAME_IN_USE');
    }

    return this.db.orm.public.Category.create({ name: dto.name, tenantId });
  }

  async update(tenantId: number, id: number, dto: UpdateCategoryDto) {
    const category = await this.db.orm.public.Category.where({
      id,
      tenantId,
    }).first();
    if (!category) {
      throw new NotFoundException();
    }

    if (dto.name && dto.name !== category.name) {
      const duplicate = await this.db.orm.public.Category.where({
        tenantId,
        name: dto.name,
      }).first();
      if (duplicate) {
        throw new ConflictException('NAME_IN_USE');
      }
    }

    return this.db.orm.public.Category.where({ id, tenantId }).update({
      name: dto.name,
    });
  }

  async remove(tenantId: number, id: number) {
    const category = await this.db.orm.public.Category.where({
      id,
      tenantId,
    }).first();
    if (!category) {
      throw new NotFoundException();
    }
    await this.db.orm.public.Category.where({ id, tenantId }).delete();
    return { id };
  }
}
