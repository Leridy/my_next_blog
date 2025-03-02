import { Prisma } from '@prisma/client';
import { db } from '../utils';

export const hotTopicStatistics = db.hotTopicStatistics as Prisma.HotTopicStatisticsDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
