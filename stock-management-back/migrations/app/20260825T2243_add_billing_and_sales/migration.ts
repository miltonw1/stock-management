#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/670c482d8a6a6dadea313240b9e61f319836aa9274f4a97525b9eb3b1943b895/contract';
import endContract from '../../snapshots/670c482d8a6a6dadea313240b9e61f319836aa9274f4a97525b9eb3b1943b895/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/edb375b0c89a7c599b66f4145d53c326e4d621146af66a47c351b4946bb25c84/contract';
import startContract from '../../snapshots/edb375b0c89a7c599b66f4145d53c326e4d621146af66a47c351b4946bb25c84/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'paymentOrder',
        columns: [
          col('amount', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('currency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('days', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('mercadopagoPaymentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('mercadopagoPreferenceId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('packageId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'paymentOrder_status_check_fc16580c',
            "\"status\" IN ('pending', 'approved', 'rejected', 'cancelled')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'sale',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('productId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tenantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('total', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('unitPrice', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'tenant',
        column: col('expiresAt', 'timestamptz', {
          notNull: true,
          default: fn('now()'),
          codecRef: { codecId: 'pg/timestamptz@1' },
        }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'paymentOrder',
        index: 'paymentOrder_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale',
        index: 'sale_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale',
        index: 'sale_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'paymentOrder',
        foreignKey: {
          name: 'paymentOrder_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale',
        foreignKey: {
          name: 'sale_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale',
        foreignKey: {
          name: 'sale_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
