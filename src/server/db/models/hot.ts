import {db} from "../utils";
import {Prisma} from "@prisma/client";

// @ts-expect-error – Prisma Client Type
export const Hot = db.HotTopic as Prisma.HotTopicDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;



