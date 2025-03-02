import { Prisma } from '@prisma/client';
import { db } from '../utils';

// @ts-expect-error – Prisma Client Type
export const vistor = db.visitor as Prisma.VisitorDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
