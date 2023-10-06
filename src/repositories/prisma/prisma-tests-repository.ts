import { Prisma, PrismaClient, Test, User } from "@prisma/client";
import { ITestsRepository } from "../i-tests-repository";
import { CreateTestPrismaType } from "../../types/create-test-prisma.types";
import { CreateAnswerPrismaType } from "../../types/create-answer-prisma.types";

export class PrismaTestsRepository implements ITestsRepository {
   private readonly _prisma: PrismaClient;

   constructor(prismaClient: PrismaClient) {
      this._prisma = prismaClient;
   }

   public async createTest(test: CreateTestPrismaType) {
      return await this._prisma.test.create({
         data: test,
      });
   }

   public async getTestById(id: string) {
      return await this._prisma.test.findUnique({
         where: {
            id
         },
      });
   }

   public async getAllTestsByQuestion(question: string) {
      return await this._prisma.test.findMany({
         where: {
            question
         },
      });
   }

   public async getAllTestsByModuleId(moduleId: string) {
      return await this._prisma.test.findMany({
         where: {
            moduleId
         },
      });
   }

   public async createAnswer(answer: CreateAnswerPrismaType) {
      return await this._prisma.answer.create({
         data: answer
      });
   }

   public async getAllAnswersByUserAndTestId(userId: string, testId: string) {
      return await this._prisma.answer.findMany({
         where: {
            userId,
            AND: {
               testId
            }
         }
      })
   }

}
