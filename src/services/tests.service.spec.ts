import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTestsRepository } from "../repositories/in-memory-repository/in-memory-tests-repository";
import { TestsService } from "./test.service";
import { TestServiceFactory } from "./factories/test.service.factory";
import { TokenDTO } from "../http/model/token-dto";
import { env } from "../env";
import { InMemoryUsersRepository } from "../repositories/in-memory-repository/in-memory-users-repository";
import { sign } from "jsonwebtoken";
import { randomUUID } from "crypto";

let inMemoryTestRepository = new InMemoryTestsRepository();
let inMemoryUsersRepository: InMemoryUsersRepository;
let testsService: TestsService;

describe("Should test Tests service", () => {
   beforeEach(() => {
      const testsServiceBuild = TestServiceFactory.buildTest();
      inMemoryTestRepository = testsServiceBuild.InMemoryTestsRepository;
      testsService = testsServiceBuild.service;
      inMemoryUsersRepository = testsServiceBuild.InMemoryUsersRepository
   });

   it("Should be able to create a test since there is no test with this module ID", async () => {
      const email = "johnydoe@email.com";
      const password = "my-secret-password";
      const issued = new Date();

      const admin = await inMemoryUsersRepository.createUser({
         email,
         username: "John doe",
         firstName: "John",
         lastName: "Doe",
         password,
         cpf: "123.345.678-91",
         issued,
         lastAccess: issued,
         privilege: "administrator",
      });

      const token = sign(
         {
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege,
         } as TokenDTO,
         env.JWT_SECURITY_KEY
      );

      const moduleId = randomUUID();
      const question = "This is a question";

      const createTestRequest: createTestRequest = {
         moduleId,
         question,
         answers: "1 answer, 2 answers, 3 answers",
         correctAnswer: "1 answer",
      };

      const test = await testsService.createTest(token, createTestRequest);

      expect(test.moduleId).toBe(moduleId);
      expect(test.question).toBe(question);
   });

   it("Should create an asnwer from an user for the test", async () => {
      const email = "johnydoe@email.com";
      const password = "my-secret-password";
      const issued = new Date();

      const admin = await inMemoryUsersRepository.createUser({
         email,
         username: "John doe",
         firstName: "John",
         lastName: "Doe",
         password,
         cpf: "123.345.678-91",
         issued,
         lastAccess: issued,
         privilege: "administrator",
      });

      const token = sign(
         {
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege,
         } as TokenDTO,
         env.JWT_SECURITY_KEY
      );

      const moduleId = randomUUID();
      const question = "This is a question";

      const createTestRequest: createTestRequest = {
         moduleId,
         question,
         answers: "1 answer, 2 answers, 3 answers",
         correctAnswer: "1 answer",
      };

      const test = await testsService.createTest(token, createTestRequest);

      const student = await inMemoryUsersRepository.createUser({
         email,
         username: "John studente",
         firstName: "John",
         lastName: "Doe",
         password,
         cpf: "123.345.678-91",
         issued,
         lastAccess: issued,
         privilege: "student",
      });

      const Stoken = sign(
         {
            id: student.id,
            password: student.password,
            privilege: student.privilege,
         } as TokenDTO,
         env.JWT_SECURITY_KEY
      );

      const studentAnswer = "2 answers";

      const createAnswerRequest: createAnswerRequest = {
         testId: test.id,
         userId: student.id,
         answer: studentAnswer,
      };

      const answer = await testsService.createAnswer(
         Stoken,
         createAnswerRequest
      );

      expect(answer?.testId).toBe(test.id);
      expect(answer?.userId).toBe(student.id);
   });

   it("Should list all tests with same moduleId", async () => {
      const email = "johnydoe@email.com";
      const password = "my-secret-password";

      const issued = new Date();

      const admin = await inMemoryUsersRepository.createUser({
         email,
         username: "John doe",
         firstName: "John",
         lastName: "Doe",
         password,
         cpf: "123.345.678-91",
         issued,
         lastAccess: issued,
         privilege: "administrator",
      });

      const token = sign(
         {
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege,
         } as TokenDTO,
         env.JWT_SECURITY_KEY
      );

      const moduleId = randomUUID();

      // Cria alguns testes fictícios com o mesmo módulo ID para os testes
      const test1 = await testsService.createTest(token, {
         moduleId,
         question: "Question 1",
         answers: "Answer 1, Answer 2",
         correctAnswer: "Answer 1",
      });

      const test2 = await testsService.createTest(token, {
         moduleId,
         question: "Question 2",
         answers: "Answer 1, Answer 2",
         correctAnswer: "Answer 2",
      });

      const test3 = await testsService.createTest(token, {
         moduleId: "wrong id",
         question: "Question 3",
         answers: "Answer 1, Answer 2",
         correctAnswer: "Answer 2",
      });

      // Obtém a lista de testes com o mesmo módulo ID
      const testsWithSameModuleId = await testsService.getAllTestByQuestion(
         moduleId
      );

      // Verifica se os testes na lista têm o módulo ID esperado
      testsWithSameModuleId.forEach((test) => {
         expect(test.moduleId).toBe(moduleId);
      });
   });
});
