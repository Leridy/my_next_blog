/**
 * @module db/utils
 * @desc This module provides utility functions for the database.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const db = prisma;
