#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/670c482d8a6a6dadea313240b9e61f319836aa9274f4a97525b9eb3b1943b895/contract';
import startContract from '../../snapshots/670c482d8a6a6dadea313240b9e61f319836aa9274f4a97525b9eb3b1943b895/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9feeddf211bc3245c8522b8e0d542d287bcb8bcfaa14f0b5ef98a51fcf73a291/contract';
import endContract from '../../snapshots/9feeddf211bc3245c8522b8e0d542d287bcb8bcfaa14f0b5ef98a51fcf73a291/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'passwordResetToken',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('usedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'passwordResetToken',
        constraint: 'passwordResetToken_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'passwordResetToken',
        index: 'passwordResetToken_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'passwordResetToken',
        foreignKey: {
          name: 'passwordResetToken_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
