# Plan — Gestor de stocks de productos para comercios

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11 + Prisma Next (Prisma 8, contract-first, PostgreSQL >= 15) |
| Frontend | React 19 + Vite 8 + Tailwind v4 + shadcn/ui |
| Modelo | Multi-tenant: cada `Tenant` (tienda) aísla sus datos vía `tenantId` |
| Auth | JWT + usuario por tienda (roles `owner`/`admin`/`employee`) |
| Producto | Identificado por nombre; stock total + una ubicación por producto |
| i18n | Español por defecto + react-i18next (es/en) |
| Módulos MVP | Productos, Categorías, Proveedores, Ubicaciones + auth + gestión de usuarios |

## Decisiones clave

- Un usuario pertenece a **una sola tienda** (`User.tenantId`). No hay selector de tenant.
- La tabla `Tenant` agrupa al dueño y sus empleados bajo la misma tienda.
- `owner`/`admin` pueden crear usuarios de su misma tienda; `employee` no.
- El `tenantId` siempre sale del JWT (`{ sub: userId, tenantId, role }`), nunca del body.

## Modelo de datos (`stock-management-back/src/prisma/contract.prisma`)

- `Tenant`: `id, name, slug (único)`
- `User`: `id, email (único), passwordHash, name, role (enum), tenantId → Tenant`
- `Category`: `id, name, tenantId` con `@@unique([tenantId, name])`
- `Supplier`: `id, name, phone?, email?, tenantId`
- `Location`: `id, name, code, tenantId` con `@@unique([tenantId, code])`
- `Product`: `id, name, description?, stock (Int, default 0), minStock (Int, default 0), price (Decimal), cost (Decimal?), unit?, categoryId?, supplierId?, locationId?, tenantId`
- `@@index([tenantId])` en todas las tablas; relaciones `onDelete: Cascade` (tenant) / `SetNull` (categoría/proveedor/ubicación).
- Enum `user_role` con `@@type("pg/text@1")`.

## Backend (NestJS)

Deps nuevas: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcryptjs`, `class-validator`, `class-transformer`.

Infraestructura: ConfigModule global, `ValidationPipe` global (`whitelist` + `transform`), CORS, prefijo `api`, `PrismaModule` (DbService), `JwtAuthGuard` + `@CurrentUser()`, filtro de excepciones centralizado.

Módulos y endpoints:
- `AuthModule`: `POST /api/auth/register` (crea Tenant + owner), `POST /api/auth/login`, `GET /api/auth/me`
- `UsersModule`: owner/admin crean empleados de su misma tienda
- `CategoriesModule`, `SuppliersModule`, `LocationsModule`: CRUD
- `ProductsModule`: `GET /api/products` (búsqueda + filtros), `POST`, `GET/:id`, `PATCH/:id`, `DELETE/:id`

Seguridad: `tenantId` desde JWT; contraseñas bcryptjs; validación con class-validator.

## Frontend (React + Vite)

- Tailwind v4 + shadcn/ui, alias `@/`, react-router v7, `@tanstack/react-query` + axios (interceptor JWT), react-i18next (es/en).
- `Layout` con sidebar + selector de idioma; páginas: `/login`, `/register`, `/products`, `/categories`, `/suppliers`, `/locations`, `/` (resumen).
- Proxy dev `/api` → `http://localhost:3000`.

## Orden de implementación

1. Contrato Prisma → `contract emit` → `db init`
2. Base backend (deps, config, auth guard)
3. Features: Auth → Users → Categories/Suppliers/Locations → Products
4. Verificar backend (build + lint + tests)
5. Base frontend (Tailwind/shadcn, i18n, router, auth store)
6. Features frontend (layout, login/registro, CRUD)
7. Integración end-to-end + build/lint

## Verificación

- Backend: `npm run build`, `npm run lint`, `npm run test`, `npm run test:e2e`
- Frontend: `npm run build` (tsc -b && vite build), `npm run lint`

## Notas de implementación

- **ORM namespaced:** en la versión instalada de Prisma 8 (rc.5), el cliente ORM es
  namespaced: se accede como `db.orm.public.<Model>` (y `tx.orm.public.<Model>` en
  transacciones), no `db.orm.<Model>` como muestran los ejemplos de la skill.
- **Money strings:** `price`/`cost` se manejan como string decimal (ej. `"10.50"`),
  tanto en el backend como en la API/frontend, para evitar errores de coma flotante.
- **Legacy scaffolds:** se corrigieron dos problemas pre-existentes del scaffold:
  `module: preserve` vs ts-jest (jest transform) y `baseUrl` deprecado (frontend TS 6).
- **`type: module` + ESM:** el backend corre como ESM real. Los imports relativos llevan
  extensión `.js` (exigencia de Node ESM); se quitó `incremental` para que `nest build`
  no omita emitir al fallar por el `deleteOutDir`. Para correr en dev: `npm run start:dev`.
- **`.env`:** se creó `stock-management-back/.env` (gitignored, se configura localmente)
  con el `DATABASE_URL` de la instancia local. No se commitea.
- **Base de datos:** `npx prisma-cli db init` ejecutado sobre `stock_management`
  (26 operaciones, tablas + índices + FKs + marcador). `migrations/` se commitea.

## Fase 2 — Suscripción (pagos por días) + "Realizar venta"

### Objetivo
Vender días de uso de la plataforma (Mercado Pago). Quien no paga **solo puede ver**
sus datos (sin modificar). Además, poder **realizar una venta** que descuente stock
sin editar el producto.

### Decisiones
- **Pagos:** Mercado Pago **Checkout Pro** (redirect + webhook). Sin pagos recurrentes.
- **Modelo de días:** vencimiento por `Tenant.expiresAt`. Al pagar se extiende.
- **Trial:** 7 días gratis al registrarse.
- **Solo lectura:** al vencer, las mutaciones devuelven `402 SUBSCRIPTION_EXPIRED`.
- **Venta:** rápida de 1 producto (producto + cantidad), rechaza stock insuficiente.
- **Paquetes:** 30d = ARS 20.000 · 90d = ARS 54.000 · 365d = ARS 192.000.

### Modelo de datos (nuevo)
- `Tenant`: agrega `expiresAt DateTime` (required, backfill existentes con now()+7d).
- `PaymentOrder`: `tenantId`, `packageId`, `days`, `amount (Decimal)`, `currency`,
  `status (enum payment_status)`, `mercadopagoPreferenceId?`, `mercadopagoPaymentId?`.
- `Sale`: `tenantId`, `productId? (SetNull)`, `productName`, `quantity`, `unitPrice`,
  `total`, `createdAt`.
- Enum `payment_status` = pending / approved / rejected / cancelled.

### Backend
- `BillingModule`:
  - `GET /api/billing/status` → `{ expiresAt, active, readOnly, packages }`
  - `POST /api/billing/checkout` `{ packageId }` → preferencia Checkout Pro,
    devuelve `{ initPoint, orderId }` (requiere `@BypassBilling`).
  - `POST /api/billing/webhook` (`@Public`) → valida pago en MP y extiende días
    (idempotente). HTTP directo a `api.mercadopago.com`.
- `SalesModule`:
  - `POST /api/sales` `{ productId, quantity }` → transacción: descuenta stock +
    crea Sale; `400 STOCK_INSUFFICIENT` si no alcanza.
  - `GET /api/sales?page=&pageSize=` → historial paginado.
- `BillingGuard` global (tras `JwtAuthGuard`): bloquea POST/PUT/PATCH/DELETE cuando
  `expiresAt <= now` → `402`. GET permitido. `@BypassBilling()` para checkout.
- `auth.service.register`: setea `expiresAt = now + trialDays`; `me`/login incluyen
  `expiresAt`.
- Util `money.ts` (multiplicación decimal sin float, cents/BigInt).

### Config (`.env`)
- `MERCADO_PAGO_ACCESS_TOKEN`, `FRONTEND_URL`, `WEBHOOK_BASE_URL` (ngrok),
  `BILLING_TRIAL_DAYS=7`, `BILLING_PACKAGES` (JSON de paquetes).

### Frontend
- Página **Suscripción**: estado + tarjetas de paquetes + botón pagar → redirige a
  `initPoint`. Rutas `/billing/success|failure|pending`.
- Banner global de **solo lectura** (contexto `readOnly`) + deshabilitar mutaciones.
- Sección **Ventas**: venta rápida (producto + cantidad + total) + historial.
  Botón "Vender" en filas de productos.
- `src/lib/api.ts`: `getBillingStatus`, `createCheckout`, `createSale`, `fetchSales`;
  interceptor detecta `402` para activar banner.

### Estado Fase 2
- Backend verificado por HTTP: trial en register, `status`, venta (descuenta stock,
  rechaza insuficiente), historial, `checkout` (Checkout Pro → `initPoint`),
  solo lectura (`402 SUBSCRIPTION_EXPIRED` en mutaciones) y `@BypassBilling` en checkout.
- `build` + `lint` + `test` OK en backend y frontend.
- **Pendiente de probar con pago real:** el webhook extiende `expiresAt` al recibir
  un pago aprobado de MP. Requiere ngrok arriba (`WEBHOOK_BASE_URL`) y hacer un pago
  de prueba (cuenta MP en modo test). El `checkout` ya devuelve `initPoint` correcto y
  la preferencia apunta a `{webhook}/api/billing/webhook`.
- Nota: MP rechazó `auto_return: 'approved'` en esta cuenta; se omitió.
- **Bug corregido (webhook + redirect):**
  - MP **descarta** `back_urls` con `http://localhost`; se reemplazó por una ruta
    pública `/{webhook}/billing/return/:mode` que redirige a `SPA_BASE_URL`
    (frontend local), y `back_urls` ahora usan la URL https de ngrok.
  - El webhook ahora acepta **GET y POST** y extrae el id de `body` o query (MP puede
    enviarlo de ambas formas). El flujo con `external_reference` = `paymentOrder.id`
    actualiza la orden y extiende `expiresAt`.
  - `FRONTEND_URL` quedó sin uso; se agregan `SPA_BASE_URL` (frontend local) y
    `WEBHOOK_BASE_URL` (ngrok) en `.env`.

## Cómo correr

Doble clic en `start-dev.cmd` (raíz) abre 2 ventanas: backend y frontend.
Alternativa: `pwsh ./start-dev.ps1`.

```bash
# Backend (http://localhost:3000)
cd stock-management-back && npm run start:dev

# Frontend (http://localhost:5173, proxies /api → :3000)
cd stock-management-front && npm run dev
```

> Requisitos: PostgreSQL arriba (vía Docker en este equipo) y `.env` configurado.

## Estado de verificación

- Backend: `npm run build`, `npm run lint`, `npm run test` → OK.
- Frontend: `npm run build`, `npm run lint` → OK.
- API end-to-end verificada por HTTP (registro → login → me → CRUD de
  categorías/proveedores/ubicaciones/productos con filtros/búsqueda → usuarios).
- `npm run test:e2e` de Jest **no corre** con Prisma Next: la librería es ESM-only
  (`.d.mts`/`.mjs`) y el runtime de Jest es CommonJS. Limitación del framework
  (pre-existente). La cobertura e2e se hace contra el servidor levantado.
