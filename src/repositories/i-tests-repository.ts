import { Answer, Test, User } from "@prisma/client";
import { CreateTestPrismaType } from "../types/create-test-prisma.types";
import { CreateAnswerPrismaType } from "../types/create-answer-prisma.types";

export interface ITestsRepository {
   createTest(test: CreateTestPrismaType): Promise<Test>;
   getAllTestsByModuleId(moduleId: string) : Promise<Test[] | null>;
   getAllTestsByQuestion(question: string): Promise<Test[] | null>;
   getTestById(id: string): Promise<Test | null>;
   createAnswer(answer: CreateAnswerPrismaType): Promise<Answer | null>;
   getAllAnswersByUserAndTestId(
      userId: string,
      testId: string
   ): Promise<Answer[] | null>;
}
