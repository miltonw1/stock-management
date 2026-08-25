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
