import {db} from "../utils";
import {Prisma} from "@prisma/client";



// @ts-expect-error – Prisma Client Type
export const User = db.User as Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
