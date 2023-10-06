import prisma from "../../lib/prisma";
import { InMemoryUsersRepository } from "../../repositories/in-memory-repository/in-memory-users-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { UsersService } from "../users.service";

export class UserServiceFactory {
    public static build() {
        const prismaUsersRepository = new PrismaUsersRepository(prisma);
        return new UsersService(prismaUsersRepository);
    }

    public static buildTest() {
        const inMemoryUsersRepository = new InMemoryUsersRepository();
        return {
            inMemoryRepository: inMemoryUsersRepository,
            service: new UsersService(inMemoryUsersRepository)
        }
    }
}