#!/usr/bin/env -S node
import endContract from '../../snapshots/edb375b0c89a7c599b66f4145d53c326e4d621146af66a47c351b4946bb25c84/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, checkExpression, col, fn, lit, primaryKey, } from '@prisma/orm-postgres/migration';
export default class M extends Migration {
    endContractJson = endContract;
    get operations() {
        return [
            this.createSchema({ schema: 'public' }),
            this.createTable({
                schema: 'public',
                table: 'category',
                columns: [
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [primaryKey(['id'])],
            }),
            this.createTable({
                schema: 'public',
                table: 'location',
                columns: [
                    col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [primaryKey(['id'])],
            }),
            this.createTable({
                schema: 'public',
                table: 'product',
                columns: [
                    col('categoryId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
                    col('cost', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('locationId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
                    col('minStock', 'int4', {
                        notNull: true,
                        default: lit(0),
                        codecRef: { codecId: 'pg/int4@1' },
                    }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('price', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
                    col('stock', 'int4', {
                        notNull: true,
                        default: lit(0),
                        codecRef: { codecId: 'pg/int4@1' },
                    }),
                    col('supplierId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
                    col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('unit', 'text', { codecRef: { codecId: 'pg/text@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [primaryKey(['id'])],
            }),
            this.createTable({
                schema: 'public',
                table: 'supplier',
                columns: [
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
                    col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [primaryKey(['id'])],
            }),
            this.createTable({
                schema: 'public',
                table: 'tenant',
                columns: [
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [primaryKey(['id'])],
            }),
            this.createTable({
                schema: 'public',
                table: 'user',
                columns: [
                    col('createdAt', 'timestamptz', {
                        notNull: true,
                        default: fn('now()'),
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                    col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
                    col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
                    col('updatedAt', 'timestamptz', {
                        notNull: true,
                        codecRef: { codecId: 'pg/timestamptz@1' },
                    }),
                ],
                constraints: [
                    primaryKey(['id']),
                    checkExpression('user_role_check_e0364f7f', "\"role\" IN ('owner', 'admin', 'employee')"),
                ],
            }),
            this.addUnique({
                schema: 'public',
                table: 'category',
                constraint: 'category_tenantId_name_key',
                columns: ['tenantId', 'name'],
            }),
            this.addUnique({
                schema: 'public',
                table: 'location',
                constraint: 'location_tenantId_code_key',
                columns: ['tenantId', 'code'],
            }),
            this.addUnique({
                schema: 'public',
                table: 'tenant',
                constraint: 'tenant_slug_key',
                columns: ['slug'],
            }),
            this.addUnique({
                schema: 'public',
                table: 'user',
                constraint: 'user_email_key',
                columns: ['email'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'category',
                index: 'category_tenantId_idx_c93ed4f1',
                columns: ['tenantId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'location',
                index: 'location_tenantId_idx_c93ed4f1',
                columns: ['tenantId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'product',
                index: 'product_categoryId_idx_15c304f2',
                columns: ['categoryId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'product',
                index: 'product_locationId_idx_7aae3038',
                columns: ['locationId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'product',
                index: 'product_supplierId_idx_c4d9a8b9',
                columns: ['supplierId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'product',
                index: 'product_tenantId_idx_c93ed4f1',
                columns: ['tenantId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'supplier',
                index: 'supplier_tenantId_idx_c93ed4f1',
                columns: ['tenantId'],
            }),
            this.createIndex({
                schema: 'public',
                table: 'user',
                index: 'user_tenantId_idx_c93ed4f1',
                columns: ['tenantId'],
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'category',
                foreignKey: {
                    name: 'category_tenantId_fkey',
                    columns: ['tenantId'],
                    references: { schema: 'public', table: 'tenant', columns: ['id'] },
                    onDelete: 'cascade',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'location',
                foreignKey: {
                    name: 'location_tenantId_fkey',
                    columns: ['tenantId'],
                    references: { schema: 'public', table: 'tenant', columns: ['id'] },
                    onDelete: 'cascade',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'product',
                foreignKey: {
                    name: 'product_categoryId_fkey',
                    columns: ['categoryId'],
                    references: { schema: 'public', table: 'category', columns: ['id'] },
                    onDelete: 'setNull',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'product',
                foreignKey: {
                    name: 'product_supplierId_fkey',
                    columns: ['supplierId'],
                    references: { schema: 'public', table: 'supplier', columns: ['id'] },
                    onDelete: 'setNull',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'product',
                foreignKey: {
                    name: 'product_locationId_fkey',
                    columns: ['locationId'],
                    references: { schema: 'public', table: 'location', columns: ['id'] },
                    onDelete: 'setNull',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'product',
                foreignKey: {
                    name: 'product_tenantId_fkey',
                    columns: ['tenantId'],
                    references: { schema: 'public', table: 'tenant', columns: ['id'] },
                    onDelete: 'cascade',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'supplier',
                foreignKey: {
                    name: 'supplier_tenantId_fkey',
                    columns: ['tenantId'],
                    references: { schema: 'public', table: 'tenant', columns: ['id'] },
                    onDelete: 'cascade',
                },
            }),
            this.addForeignKey({
                schema: 'public',
                table: 'user',
                foreignKey: {
                    name: 'user_tenantId_fkey',
                    columns: ['tenantId'],
                    references: { schema: 'public', table: 'tenant', columns: ['id'] },
                    onDelete: 'cascade',
                },
            }),
        ];
    }
}
MigrationCLI.run(import.meta.url, M);
//# sourceMappingURL=migration.js.map