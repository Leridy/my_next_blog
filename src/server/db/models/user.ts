import { db } from '../utils';
import { Prisma } from '@prisma/client';

export const User = db.User as Prisma.UserDelegate<
  // @ts-expect-error – Prisma Client Type
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
>;
