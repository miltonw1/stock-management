import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BypassBilling } from '../common/decorators/bypass-billing.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { JwtPayload } from '../common/types/auth.types.js';
import { BillingService, type PaymentStatusResult } from './billing.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('status')
  status(@CurrentUser() user: JwtPayload): Promise<PaymentStatusResult> {
    return this.billingService.status(user.tenantId);
  }

  @BypassBilling()
  @Post('checkout')
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.billingService.checkout(user.tenantId, dto);
  }

  @Public()
  @Post('webhook')
  webhookPost(@Body() body: Record<string, unknown>) {
    return this.billingService.processPayment(this.extractPaymentId(body, {}));
  }

  @Public()
  @Get('webhook')
  webhookGet(@Query() query: Record<string, string>) {
    return this.billingService.processPayment(this.extractPaymentId({}, query));
  }

  @Public()
  @Get('return/:mode')
  returnPage(@Param('mode') mode: string, @Res() res: Response) {
    const target = this.billingService.returnTarget(mode);
    res
      .type('text/html')
      .send(
        `<!doctype html><html><head><meta charset="utf-8"></head><body>` +
          `<script>window.location.replace(${JSON.stringify(target)});</script>` +
          `<p>Redirigiendo…</p></body></html>`,
      );
  }

  private extractPaymentId(
    body: Record<string, unknown>,
    query: Record<string, string>,
  ): string {
    const data = body['data'] as { id?: string } | undefined;
    if (data && typeof data.id === 'string') return data.id;
    if (typeof body['id'] === 'string') return body['id'];
    if (query['data.id']) return query['data.id'];
    if (query['id']) return query['id'];
    return '';
  }
}
