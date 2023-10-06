import { ConflictError } from "../../src/errors/conflict-error";
import { ForbiddenError } from "../../src/errors/forbidden-error";
import { NotFoundError } from "../../src/errors/not-found-error";
import { authenticateUser } from "../lib/extensions/authenticate-user";
import { ITestsRepository } from "../repositories/i-tests-repository";
import { IUsersRepository } from "../repositories/i-users-repository";

export class TestsService {
   constructor(
      private readonly _userRepository: IUsersRepository,
      private readonly _testRepository: ITestsRepository
   ) { }

   public async createTest(authorization: string, createTestRequest: createTestRequest) {
      const authenticatedUser = await authenticateUser(
         authorization,
         this._userRepository
      );
      if (authenticatedUser.privilege != "administrator") {
         throw new ForbiddenError("Acesso negado");
      }

      const alreadyExistTestWithQuestion = await this._testRepository.getAllTestsByQuestion(
         createTestRequest.question
      );
      const alreadyExistTestWithMID = await this._testRepository.getAllTestsByModuleId(
         createTestRequest.moduleId
      );

      if (alreadyExistTestWithMID?.some(test => test.question === createTestRequest.question)) {
         throw new ConflictError(`Teste com a mesma pergunta e moduleId já existe`);
      }

      const test = await this._testRepository.createTest({
         moduleId: createTestRequest.moduleId,
         question: createTestRequest.question,
         answers: createTestRequest.answers,
         correctAnswer: createTestRequest.correctAnswer,
      });

      return test;
   }

   public async getAllTestsByModuleId(moduleId: string) {
      const tests = await this._testRepository.getAllTestsByModuleId(moduleId)
      if(!tests) {
         throw new NotFoundError("Could not find any tests")
      }
      return tests
   }

   public async getTestById(id: string) {
      const test = await this._testRepository.getTestById(id)
      if (!test) {
         throw new NotFoundError("Could not find test")
      }
      return test
   }

   public async getAllTestByQuestion(question: string) {
      const tests = await this._testRepository.getAllTestsByQuestion(question)
      if (!tests) {
         throw new NotFoundError("Could not find tests with moduleId")
      }
      return tests
   }

   public async createAnswer(authorization: string | undefined, createAnswerRequest: createAnswerRequest) {
      const authenticatedUser = await authenticateUser(authorization || ' ', this._userRepository);
      if (authenticatedUser.privilege != "student")
         throw new ForbiddenError("Access denied");


      const answer = await this._testRepository.createAnswer({
         testId: createAnswerRequest.testId,
         userId: createAnswerRequest.userId,
         answer: createAnswerRequest.answer
      })

      return answer
   }

   public async getAllAnswersByUserAndTestId(authorization: string, testId: string) {
      const refUser = await authenticateUser(authorization, this._userRepository)

      const refTest = await this.getTestById(testId)
      if (!refTest) {
         throw new NotFoundError("Could not find test")
      }

      const answers = await this._testRepository.getAllAnswersByUserAndTestId(refUser.id, refTest.id)
      if (!answers) {
         throw new NotFoundError("Could not find answers for user")
      }

      return answers
   }
}
