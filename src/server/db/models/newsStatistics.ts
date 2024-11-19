import {db} from "../utils";
import {Prisma} from "@prisma/client";



// @ts-expect-error – Prisma Client Type
export const HotNewsStatistics = db.HotNewsStatistics as Prisma.HotNewsStatsticDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
