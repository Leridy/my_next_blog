/**
 * @module db/utils
 * @desc This module provides utility functions for the database.
 */

import {PrismaClient} from '@prisma/client/index';

// @ts-expect-error – Avoid reinitializing Prisma Client
if (!global.db) {
  // @ts-expect-error – Prisma Client Type
  global.db = new PrismaClient();
}


// @ts-expect-error – Prisma Client Type
export const db = global.db as PrismaClient;
