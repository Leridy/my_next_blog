import {Prisma} from "@prisma/client";
import {db} from "../utils";


// @ts-expect-error – Prisma Client Type
export const vistor = db.visitor as Prisma.VisitorDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
