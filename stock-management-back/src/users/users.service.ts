import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DbService } from '../prisma/db.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DbService) {}

  private get db() {
    return this.dbService.db;
  }

  async create(tenantId: number, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.db.orm.public.User.where((u) =>
      u.email.eq(email),
    ).first();
    if (existing) {
      throw new ConflictException('EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.db.orm.public.User.create({
      email,
      passwordHash,
      name: dto.name,
      role: dto.role,
      tenantId,
    });

    return this.toSafeUser(user);
  }

  async findAll(tenantId: number) {
    const users = await this.db.orm.public.User.select(
      'id',
      'email',
      'name',
      'role',
      'createdAt',
    )
      .where((u) => u.tenantId.eq(tenantId))
      .orderBy((u) => u.name.asc())
      .all();

    return users;
  }

  private toSafeUser(user: {
    id: number;
    email: string;
    name: string;
    role: string;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
