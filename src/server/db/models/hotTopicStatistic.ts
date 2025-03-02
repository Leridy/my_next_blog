import { Prisma } from '@prisma/client';
import { db } from '../utils';

// @ts-expect-error – Prisma Client Type
export const hotTopicStatistics =
  db.hotTopicStatistics as Prisma.HotTopicStatisticsDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;
