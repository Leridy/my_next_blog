import {db} from "../utils";
import {Prisma} from "@prisma/client";

// @ts-ignore
export const Hot = db.HotTopic as Prisma.HotTopicDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;



