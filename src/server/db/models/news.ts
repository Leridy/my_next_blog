import { db } from '../utils';
import { Prisma } from '@prisma/client';

export const HotNews = db.HotNews as Prisma.HotNewsDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
