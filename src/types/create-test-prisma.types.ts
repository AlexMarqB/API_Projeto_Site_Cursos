import { Prisma } from "@prisma/client";

export type CreateTestPrismaType = (Prisma.Without<Prisma.TestCreateInput, Prisma.TestUncheckedCreateInput> & Prisma.TestUncheckedCreateInput) | (Prisma.Without<Prisma.TestUncheckedCreateInput, Prisma.TestCreateInput> & Prisma.TestCreateInput);