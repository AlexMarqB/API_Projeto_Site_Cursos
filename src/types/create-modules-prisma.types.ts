import { Prisma } from "@prisma/client";

export type CreateModulePrismaType = (Prisma.Without<Prisma.ModuleCreateInput, Prisma.ModuleUncheckedCreateInput> & Prisma.ModuleUncheckedCreateInput) | (Prisma.Without<Prisma.ModuleUncheckedCreateInput, Prisma.ModuleCreateInput> & Prisma.ModuleCreateInput)