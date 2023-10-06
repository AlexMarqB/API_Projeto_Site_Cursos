import prisma from "../../lib/prisma";
import { InMemoryCoursesRepository } from "../../repositories/in-memory-repository/in-memory-courses-repository";
import { InMemoryEnrollmentsRepository } from "../../repositories/in-memory-repository/in-memory-enrollments-repository";
import { InMemoryModulesRepository } from "../../repositories/in-memory-repository/in-memory-modules-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory-repository/in-memory-users-repository";
import { PrismaCoursesRepository } from "../../repositories/prisma/prisma-courses-repository";
import { PrismaEnrollmentsRepository } from "../../repositories/prisma/prisma-enrollments-repository";
import { PrismaModulesRepository } from "../../repositories/prisma/prisma-modules-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { ModulesService } from "../modules.service";

export class ModulesServiceFactory {
    public static build() {
        const prismaUsersRepository = new PrismaUsersRepository(prisma);
        const prismaCoursesRepository = new PrismaCoursesRepository(prisma);
        const prismaModulesRepository = new PrismaModulesRepository(prisma);
        const prismaEnrollmentsRepository = new PrismaEnrollmentsRepository(prisma);

        return new ModulesService(
            prismaUsersRepository,
            prismaCoursesRepository,
            prismaModulesRepository,
            prismaEnrollmentsRepository
        );
    }

    public static buildTest() {
        const inMemoryUsersRepository = new InMemoryUsersRepository();
        const inMemoryCoursesRepository = new InMemoryCoursesRepository();
        const inMemoryModulesRepository = new InMemoryModulesRepository();
        const inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();

        return {
            inMemoryUsersRepository,
            inMemoryCoursesRepository,
            inMemoryModulesRepository,
            inMemoryEnrollmentsRepository,
            service: new ModulesService(
                inMemoryUsersRepository,
                inMemoryCoursesRepository,
                inMemoryModulesRepository,
                inMemoryEnrollmentsRepository
            )
        }
    }
}