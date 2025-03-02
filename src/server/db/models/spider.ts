import { db } from '../utils';
import { Prisma } from '@prisma/client';

export const HotSpider = db.HotSpider as Prisma.HotSpiderDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
