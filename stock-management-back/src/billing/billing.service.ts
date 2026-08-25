import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbService } from '../prisma/db.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';

export interface BillingPackage {
  id: string;
  label: string;
  days: number;
  price: number;
}

export interface PaymentStatusResult {
  expiresAt: Date;
  active: boolean;
  readOnly: boolean;
  packages: BillingPackage[];
}

@Injectable()
export class BillingService {
  constructor(
    private readonly dbService: DbService,
    private readonly config: ConfigService,
  ) {}

  private get db() {
    return this.dbService.db;
  }

  private get packages(): BillingPackage[] {
    try {
      const raw = this.config.get<string>('BILLING_PACKAGES') ?? '[]';
      return JSON.parse(raw) as BillingPackage[];
    } catch {
      return [];
    }
  }

  private get mpToken(): string {
    return this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN') ?? '';
  }

  private get webhookBaseUrl(): string {
    return (
      this.config.get<string>('WEBHOOK_BASE_URL') ?? 'http://localhost:3000'
    );
  }

  private get spaUrl(): string {
    return this.config.get<string>('SPA_BASE_URL') ?? 'http://localhost:5173';
  }

  async status(tenantId: number): Promise<PaymentStatusResult> {
    const tenant = await this.db.orm.public.Tenant.where({
      id: tenantId,
    }).first();
    if (!tenant) {
      throw new NotFoundException();
    }
    const active = new Date(tenant.expiresAt).getTime() > Date.now();
    return {
      expiresAt: tenant.expiresAt,
      active,
      readOnly: !active,
      packages: this.packages,
    };
  }

  async checkout(tenantId: number, dto: CheckoutDto) {
    const pkg = this.packages.find((p) => p.id === dto.packageId);
    if (!pkg) {
      throw new BadRequestException('INVALID_PACKAGE');
    }
    if (!this.mpToken) {
      throw new BadRequestException('MP_NOT_CONFIGURED');
    }

    const pending = await this.db.orm.public.PaymentOrder.where({
      tenantId,
      packageId: pkg.id,
      status: 'pending',
    })
      .orderBy((o) => o.id.desc())
      .first();

    if (pending?.mercadopagoPreferenceId) {
      const initPoint = await this.getPreferenceInitPoint(
        pending.mercadopagoPreferenceId,
      );
      if (initPoint) {
        return {
          orderId: pending.id,
          initPoint,
          package: pkg,
        };
      }
    }

    const order = await this.db.orm.public.PaymentOrder.create({
      tenantId,
      packageId: pkg.id,
      days: pkg.days,
      amount: String(pkg.price),
      currency: 'ARS',
      status: 'pending',
    });

    const preference = await this.createPreference(order.id, pkg);

    if (preference.id) {
      await this.db.orm.public.PaymentOrder.where({ id: order.id }).update({
        mercadopagoPreferenceId: preference.id,
      });
    }

    return {
      orderId: order.id,
      initPoint: preference.initPoint,
      package: pkg,
    };
  }

  returnTarget(mode: string): string {
    return `${this.spaUrl}/billing/${mode}`;
  }

  async processPayment(paymentId: string) {
    if (!paymentId) {
      return { received: false };
    }

    const payment = await this.getMpPayment(paymentId);
    const externalReference = payment.externalReference;
    if (!externalReference) {
      return { received: true };
    }

    const order = await this.db.orm.public.PaymentOrder.where({
      id: Number(externalReference),
    }).first();
    if (!order || order.status === 'approved') {
      return { received: true };
    }

    if (payment.status === 'approved') {
      const tenant = await this.db.orm.public.Tenant.where({
        id: order.tenantId,
      }).first();
      if (tenant) {
        const base = Math.max(Date.now(), new Date(tenant.expiresAt).getTime());
        const newExpiresAt = new Date(base + order.days * 24 * 60 * 60 * 1000);
        await this.db.orm.public.Tenant.where({ id: tenant.id }).update({
          expiresAt: newExpiresAt,
        });
      }
      await this.db.orm.public.PaymentOrder.where({ id: order.id }).update({
        status: 'approved',
        mercadopagoPaymentId: String(paymentId),
      });
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      await this.db.orm.public.PaymentOrder.where({ id: order.id }).update({
        status: payment.status,
      });
    }

    return { received: true };
  }

  private async getPreferenceInitPoint(
    preferenceId: string,
  ): Promise<string | undefined> {
    const res = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.mpToken}` },
      },
    );
    if (!res.ok) {
      return undefined;
    }
    const body = (await res.json()) as { init_point?: string };
    return body.init_point;
  }

  private async createPreference(orderId: number, pkg: BillingPackage) {
    const res = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.mpToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: pkg.label,
              quantity: 1,
              unit_price: pkg.price,
              currency_id: 'ARS',
            },
          ],
          external_reference: String(orderId),
          back_urls: {
            success: `${this.webhookBaseUrl}/billing/return/success`,
            failure: `${this.webhookBaseUrl}/billing/return/failure`,
            pending: `${this.webhookBaseUrl}/billing/return/pending`,
          },
          notification_url: `${this.webhookBaseUrl}/api/billing/webhook`,
        }),
      },
    );

    if (!res.ok) {
      throw new BadRequestException(`MP_ERROR:${res.status}`);
    }

    const body = (await res.json()) as {
      id?: string;
      init_point?: string;
    };
    return { id: body.id, initPoint: body.init_point };
  }

  private async getMpPayment(paymentId: string) {
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.mpToken}` },
      },
    );
    const body = (await res.json()) as {
      status?: string;
      external_reference?: string;
    };
    return {
      status: body.status,
      externalReference: body.external_reference,
    };
  }
}
