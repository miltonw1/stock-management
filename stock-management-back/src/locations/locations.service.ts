import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';

@Injectable()
export class LocationsService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  findAll(tenantId: number) {
    return this.db.orm.public.Location.where((l) => l.tenantId.eq(tenantId))
      .orderBy((l) => l.name.asc())
      .all();
  }

  async create(tenantId: number, dto: CreateLocationDto) {
    const existing = await this.db.orm.public.Location.where({
      tenantId,
      code: dto.code,
    }).first();
    if (existing) {
      throw new ConflictException('CODE_IN_USE');
    }

    return this.db.orm.public.Location.create({
      name: dto.name,
      code: dto.code,
      tenantId,
    });
  }

  async update(tenantId: number, id: number, dto: UpdateLocationDto) {
    const location = await this.db.orm.public.Location.where({
      id,
      tenantId,
    }).first();
    if (!location) {
      throw new NotFoundException();
    }

    const nextCode = dto.code ?? location.code;
    if (dto.code && dto.code !== location.code) {
      const duplicate = await this.db.orm.public.Location.where({
        tenantId,
        code: dto.code,
      }).first();
      if (duplicate) {
        throw new ConflictException('CODE_IN_USE');
      }
    }

    return this.db.orm.public.Location.where({ id, tenantId }).update({
      name: dto.name ?? location.name,
      code: nextCode,
    });
  }

  async remove(tenantId: number, id: number) {
    const location = await this.db.orm.public.Location.where({
      id,
      tenantId,
    }).first();
    if (!location) {
      throw new NotFoundException();
    }
    await this.db.orm.public.Location.where({ id, tenantId }).delete();
    return { id };
  }
}
