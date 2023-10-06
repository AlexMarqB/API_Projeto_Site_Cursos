import { Prisma } from "@prisma/client";

export type CreateClassPrismaType = (Prisma.Without<Prisma.ClassCreateInput, Prisma.ClassUncheckedCreateInput> & Prisma.ClassUncheckedCreateInput) | (Prisma.Without<Prisma.ClassUncheckedCreateInput, Prisma.ClassCreateInput> & Prisma.ClassCreateInput);