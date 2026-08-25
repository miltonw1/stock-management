export type UserRole = 'owner' | 'admin' | 'employee';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  tenantId: number;
  iat?: number;
  exp?: number;
}
