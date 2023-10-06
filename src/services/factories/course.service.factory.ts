import prisma from "../../lib/prisma";
import { InMemoryCoursesRepository } from "../../repositories/in-memory-repository/in-memory-courses-repository";
import { InMemoryEnrollmentsRepository } from "../../repositories/in-memory-repository/in-memory-enrollments-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory-repository/in-memory-users-repository";
import { PrismaCoursesRepository } from "../../repositories/prisma/prisma-courses-repository";
import { PrismaEnrollmentsRepository } from "../../repositories/prisma/prisma-enrollments-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { CoursesService } from "../courses.service";

export class CourseServiceFactory {
    public static build() {
        const prismaUserRepository = new PrismaUsersRepository(prisma);
        const prismaCoursesRepository = new PrismaCoursesRepository(prisma);
        const prismaEnrollmentsRepository = new PrismaEnrollmentsRepository(prisma);

        return new CoursesService(prismaUserRepository, prismaCoursesRepository, prismaEnrollmentsRepository);
    }

    public static buildTest() {
        const inMemoryUsersRepository = new InMemoryUsersRepository();
        const inMemoryCoursesRepository = new InMemoryCoursesRepository();
        const inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();

        return {
            inMemoryUsersRepository,
            inMemoryCoursesRepository,
            inMemoryEnrollmentsRepository,
            service: new CoursesService(inMemoryUsersRepository, inMemoryCoursesRepository, inMemoryEnrollmentsRepository)
        }
    }
}