import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DbService } from '../prisma/db.service.js';
import type { JwtPayload, UserRole } from '../common/types/auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'tienda'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get db() {
    return this.dbService.db;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.db.orm.public.User.where((u) =>
      u.email.eq(email),
    ).first();
    if (existing) {
      throw new ConflictException('EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = await this.uniqueSlug(dto.tenantName);

    const { user, tenant } = await this.db.transaction(async (tx) => {
      const tenant = await tx.orm.public.Tenant.create({
        name: dto.tenantName,
        slug,
      });
      const user = await tx.orm.public.User.create({
        email,
        passwordHash,
        name: dto.name,
        role: 'owner',
        tenantId: tenant.id,
      });
      return { user, tenant };
    });

    return this.buildAuthResult(user, tenant);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.db.orm.public.User.include('tenant', (t) =>
      t.select('id', 'name', 'slug'),
    )
      .where((u) => u.email.eq(email))
      .first();

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.buildAuthResult(user, user.tenant);
  }

  async me(payload: JwtPayload) {
    const user = await this.db.orm.public.User.include('tenant', (t) =>
      t.select('id', 'name', 'slug'),
    )
      .where({ id: payload.sub, tenantId: payload.tenantId })
      .first();

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      user: this.toSafeUser(user),
      tenant: user.tenant,
    };
  }

  private buildAuthResult(
    user: { id: number; email: string; name: string; role: UserRole },
    tenant: { id: number; name: string; slug: string },
  ) {
    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      } satisfies JwtPayload,
      {
        expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ??
          '7d') as JwtSignOptions['expiresIn'],
      },
    );

    return {
      accessToken,
      user: this.toSafeUser(user),
      tenant,
    };
  }

  private toSafeUser(user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const existing = await this.db.orm.public.Tenant.where({
      slug: base,
    }).first();
    if (!existing) {
      return base;
    }
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
  }
}
