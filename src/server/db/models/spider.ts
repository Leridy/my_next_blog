import {db} from "../utils";
import {Prisma} from "@prisma/client";



// @ts-expect-error – Prisma Client Type
export const HotSpider = db.HotSpider as Prisma.HotSpiderDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;



