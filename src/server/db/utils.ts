/**
 * @module db/utils
 * @desc This module provides utility functions for the database.
 */
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const currentEnv = process.env.CURRENT_ENV || 'development';

if (currentEnv === 'development') {
  // @ts-expect-error – Prisma Client Type
  if (!global.db) {
    // @ts-expect-error – Prisma Client Type
    global.db = new PrismaClient();
  }
} else {
  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}`;

  // @ts-expect-error – Prisma Client Type
  if (!globalThis.db) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    // @ts-expect-error – Prisma Client Type
    globalThis.db = new PrismaClient({ adapter });
  }
}

// @ts-expect-error – Prisma Client Type
export const db = globalThis?.db || global.db;
