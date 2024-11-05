import {db} from "../utils";
import {Prisma} from "@prisma/client";



// @ts-expect-error – Prisma Client Type
export const HotNews = db.HotNews as Prisma.HotNewsDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
