# Resend — Envío de emails de restablecimiento de contraseña

Guía autocontenida para replicar el envío de emails de reseteo de contraseña (Resend) en un proyecto NestJS + React, tal como se implementó en este repo.

## Viabilidad y claves

- La `RESEND_API_KEY` pertenece a **tu cuenta de Resend**, no a un proyecto. Podés reusar **exactamente la misma** key en varios proyectos.
- Restricción importante: mientras use el dominio por defecto `onboarding@resend.dev`, **solo puede enviar a tu propio email** (el de tu cuenta de Resend).
- Para enviar a destinatarios arbitrarios, hay que verificar un dominio propio en [resend.com/domains](https://resend.com/domains) y setear `EMAIL_FROM` con ese dominio.

---

## Backend (NestJS)

### 1. Instalar la dependencia

```bash
pnpm add resend
```

### 2. Variables de entorno (`.env`)

```bash
# Email (Resend)
RESEND_API_KEY="re_xxx"
EMAIL_FROM="onboarding@resend.dev"  # o "Gym Manager <no-reply@tudominio.com>" con dominio verificado

# Frontend (base para armar el link de reset)
FRONTEND_URL="http://localhost:5173"
```

### 3. Modelo Prisma `PasswordResetToken`

Agregar a `schema.prisma` (y la relación en `User`):

```prisma
model User {
  id        Int      @id @default(autoincrement())
  ...
  passwordResetTokens PasswordResetToken[]
}

model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
}
```

Migración:

```bash
npx prisma migrate dev --name add_password_reset_tokens
```

### 4. `src/mail/mail.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private $resend?: Resend;

  private get resend(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not configured. Set it in the environment variables.',
      );
    }
    if (!this.$resend) {
      this.$resend = new Resend(apiKey);
    }
    return this.$resend;
  }

  private get from(): string {
    return process.env.EMAIL_FROM || 'onboarding@resend.dev';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      // Sin API key (dev): logueamos el enlace en vez de enviar el email.
      this.logger.log(`[Password Reset] ${to} -> ${resetUrl}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Restablecé tu contraseña',
        html: `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Hacé clic en el siguiente enlace para elegir una nueva contraseña:</p>
          <p><a href="${resetUrl}">Restablecer mi contraseña</a></p>
          <p>El enlace es válido por 1 hora. Si no solicitaste esto, podés ignorar este email.</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${String(error)}`,
      );
    }
  }
}
```

### 5. `src/mail/mail.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

### 6. DTOs

`src/auth/dto/forgot-password.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

`src/auth/dto/reset-password.dto.ts`:

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

### 7. Wiring en `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    SubscriptionsModule,
    MailModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, UsersService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### 8. `src/auth/auth.service.ts` (forgotPassword y resetPassword)

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
    private mailService: MailService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Mensaje genérico para no revelar si el email existe.
      return {
        message:
          'Si el email existe, te enviamos un enlace para restablecer tu contraseña.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return {
      message:
        'Si el email existe, te enviamos un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'El enlace es inválido o ya expiró. Solicita uno nuevo.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      await tx.user.update({
        where: { id: record.userId },
        data: {
          password: {
            upsert: {
              create: { hash: hashedPassword },
              update: { hash: hashedPassword },
            },
          },
        },
      });
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
```

### 9. Endpoints en `src/auth/auth.controller.ts`

```typescript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }
}
```

---

## Frontend (React)

### 1. Métodos en `src/services/auth.service.ts`

```typescript
async forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

async resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    password,
  });
  return data;
}
```

### 2. Rutas en `App.tsx`

```tsx
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

<Route path='/forgot-password' element={<ForgotPasswordPage />} />
<Route path='/reset-password' element={<ResetPasswordPage />} />
```

### 3. Formularios

- `ForgotPasswordForm`: input de email con Zod, llama a `authService.forgotPassword(email)` y muestra el mensaje genérico.
- `ResetPasswordForm`: lee el token de la URL (`useSearchParams().get('token')`), formulario de nueva contraseña + confirmación (Zod, mínimo 6 caracteres, valida que coincidan), invoca `authService.resetPassword(token, password)`. Si falla, muestra el error del backend.

---

## Tests (referencia)

En `auth.service.spec.ts`, mockear `MailService` y verificar:

- Email inexistente → no se crea token ni se llama a `sendPasswordResetEmail`.
- Email existente → se crea token (y se invalidan los previos) y se llama a `sendPasswordResetEmail(email, resetUrl)` donde `resetUrl` contiene `/reset-password?token=`.

---

## Caveats

1. **Dominio verificado**: `onboarding@resend.dev` solo envía a tu propio email. Para otros destinatarios, verificar un dominio en Resend y setear `EMAIL_FROM` con ese dominio.
2. **`FRONTEND_URL` en prod**: apuntar a la URL real del frontend deployado para que el link del mail sea correcto.
3. **Fallback dev**: si no hay `RESEND_API_KEY`, `MailService` loguea el link a consola (comportamiento de desarrollo) sin romper el flujo.
4. **Single-use y expiración**: el token se hashea (sha256) guardado; se invalida al usarse y expira en 1 hora.
