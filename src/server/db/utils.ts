/**
 * @module db/utils
 * @desc This module provides utility functions for the database.
 */

import { PrismaClient } from '@prisma/client/index';

const prisma = new PrismaClient();

export const db = prisma;
