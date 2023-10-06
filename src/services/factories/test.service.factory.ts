import prisma from "../../lib/prisma";
import { InMemoryTestsRepository } from "../../repositories/in-memory-repository/in-memory-tests-repository";
import { InMemoryUsersRepository } from "../../repositories/in-memory-repository/in-memory-users-repository";
import { PrismaTestsRepository } from "../../repositories/prisma/prisma-tests-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { TestsService } from "../test.service";


export class TestServiceFactory {
   public static build () {
      const prismaUsersRepository = new PrismaUsersRepository(prisma);
      const prismaTestRepository = new PrismaTestsRepository(prisma)
      return new TestsService(prismaUsersRepository ,prismaTestRepository)
   }

   public static buildTest() {
      const inMemoryUsersRepository = new InMemoryUsersRepository
      const inMemoryTestsRepository = new InMemoryTestsRepository
      return {
         InMemoryUsersRepository: inMemoryUsersRepository,
         InMemoryTestsRepository: inMemoryTestsRepository,
         service: new TestsService(inMemoryUsersRepository, inMemoryTestsRepository)
      }
   }
}