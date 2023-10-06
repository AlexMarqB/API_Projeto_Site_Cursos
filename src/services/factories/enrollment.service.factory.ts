import prisma from "../../lib/prisma";
import { InMemoryCoursesRepository } from "../../repositories/in-memory-repository/in-memory-courses-repository";
import { InMemoryEnrollmentsRepository } from "../../repositories/in-memory-repository/in-memory-enrollments-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory-repository/in-memory-users-repository";
import { PrismaCoursesRepository } from "../../repositories/prisma/prisma-courses-repository";
import { PrismaEnrollmentsRepository } from "../../repositories/prisma/prisma-enrollments-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { EnrollmentsService } from "../enrollments.service";

export class EnrollmentServiceFactory {
    public static build() {
        const prismaUsersRepository = new PrismaUsersRepository(prisma);
        const prismaEnrollmentsRepository = new PrismaEnrollmentsRepository(prisma);
        const prismaCoursesRepository = new PrismaCoursesRepository(prisma);

        return new EnrollmentsService(prismaUsersRepository, prismaEnrollmentsRepository, prismaCoursesRepository);
    }

    public static buildTest() {
        const inMemoryUsersRepository = new InMemoryUsersRepository();
        const inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
        const inMemoryCoursesRepository = new InMemoryCoursesRepository();

        return {
            inMemoryUsersRepository,
            inMemoryEnrollmentsRepository,
            inMemoryCoursesRepository,
            service: new EnrollmentsService(inMemoryUsersRepository, inMemoryEnrollmentsRepository, inMemoryCoursesRepository)
        }
    }
}