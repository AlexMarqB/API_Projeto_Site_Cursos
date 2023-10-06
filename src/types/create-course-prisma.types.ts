import { Prisma } from "@prisma/client";

export type CreateCoursePrismaType = (Prisma.Without<Prisma.CourseCreateInput, Prisma.CourseUncheckedCreateInput> & Prisma.CourseUncheckedCreateInput) | (Prisma.Without<Prisma.CourseUncheckedCreateInput, Prisma.CourseCreateInput> & Prisma.CourseCreateInput);