import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DbService } from '../../prisma/db.service.js';
import { BYPASS_BILLING_KEY } from '../decorators/bypass-billing.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { JwtPayload } from '../types/auth.types.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class BillingGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dbService: DbService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      method: string;
    }>();
    const user = request.user;
    if (!user) {
      return true;
    }

    if (!WRITE_METHODS.has(request.method)) {
      return true;
    }

    const bypass = this.reflector.getAllAndOverride<boolean>(
      BYPASS_BILLING_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (bypass) {
      return true;
    }

    const tenant = await this.dbService.db.orm.public.Tenant.where({
      id: user.tenantId,
    }).first();

    if (!tenant || new Date(tenant.expiresAt).getTime() <= Date.now()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'SUBSCRIPTION_EXPIRED',
          error: 'Payment Required',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
