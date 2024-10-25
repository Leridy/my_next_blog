import {db} from "../utils";
import {Prisma} from "@prisma/client";

export const Hot = db.HotTopic as Prisma.HotTopicDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;



