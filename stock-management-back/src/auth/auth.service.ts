import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DbService } from '../prisma/db.service.js';
import { MailService } from '../mail/mail.service.js';
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

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private get db() {
    return this.dbService.db;
  }

  private get spaUrl(): string {
    return this.config.get<string>('SPA_BASE_URL') ?? 'http://localhost:5173';
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
    const trialDays = Number(
      this.config.get<string>('BILLING_TRIAL_DAYS') ?? 7,
    );
    const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    const { user, tenant } = await this.db.transaction(async (tx) => {
      const tenant = await tx.orm.public.Tenant.create({
        name: dto.tenantName,
        slug,
        expiresAt,
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
      t.select('id', 'name', 'slug', 'expiresAt'),
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
      t.select('id', 'name', 'slug', 'expiresAt'),
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

  async forgotPassword(email: string) {
    const normalized = email.toLowerCase();
    const user = await this.db.orm.public.User.where((u) =>
      u.email.eq(normalized),
    ).first();

    const message =
      'Si el email existe, te enviamos un enlace para restablecer tu contraseña.';

    if (!user) {
      return { message };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.db.transaction(async (tx) => {
      await tx.orm.public.PasswordResetToken.where({
        userId: user.id,
        usedAt: null,
      }).update({ usedAt: new Date() });

      await tx.orm.public.PasswordResetToken.create({
        userId: user.id,
        tokenHash,
        expiresAt,
      });
    });

    const resetUrl = `${this.spaUrl}/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.db.orm.public.PasswordResetToken.where({
      tokenHash,
    }).first();

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('INVALID_RESET_TOKEN');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.db.transaction(async (tx) => {
      await tx.orm.public.PasswordResetToken.where({ id: record.id }).update({
        usedAt: new Date(),
      });

      await tx.orm.public.User.where({ id: record.userId }).update({
        passwordHash: hashedPassword,
      });
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }

  private buildAuthResult(
    user: { id: number; email: string; name: string; role: UserRole },
    tenant: { id: number; name: string; slug: string; expiresAt: Date },
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
