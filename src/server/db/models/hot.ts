import { db } from '../utils';
import { Prisma } from '@prisma/client';

export const Hot = db.HotTopic as Prisma.HotTopicDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
