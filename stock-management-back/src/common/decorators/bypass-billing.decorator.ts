import { SetMetadata } from '@nestjs/common';

export const BYPASS_BILLING_KEY = 'bypassBilling';
export const BypassBilling = () => SetMetadata(BYPASS_BILLING_KEY, true);
