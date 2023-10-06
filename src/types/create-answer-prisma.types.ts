import { Prisma } from "@prisma/client";

export type CreateAnswerPrismaType = (Prisma.Without<Prisma.AnswerCreateInput, Prisma.AnswerUncheckedCreateInput> & Prisma.AnswerUncheckedCreateInput) | (Prisma.Without<Prisma.AnswerUncheckedCreateInput, Prisma.AnswerCreateInput> & Prisma.AnswerCreateInput);