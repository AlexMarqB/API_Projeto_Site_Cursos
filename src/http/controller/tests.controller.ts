import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { TestsService } from "../../services/test.service";
import { PrismaTestsRepository } from "../../repositories/prisma/prisma-tests-repository";
import prisma from "../../lib/prisma";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";

const testSchema = z.object({
   moduleId: z.string(),
   question: z.string(),
   answers: z.string(),
   correctAnswer: z.string()
})

const answerSchema = z.object({
   testId: z.string(),
   userId: z.string(),
   answer: z.string()
})

const testsService = new TestsService(new PrismaUsersRepository(prisma), new PrismaTestsRepository(prisma))

export async function createTestController(req: FastifyRequest, rep: FastifyReply) {
   const createTestRequest = testSchema.parse(req.body)

   const authorization = req.headers.authorization?.split(' ')[1]


   await testsService.createTest(authorization || ' ', createTestRequest)


   return rep.status(201).send()
}

export async function getTestById(req: FastifyRequest, rep: FastifyReply) {
   const getTestRequest = req.params as { id: string }

   await testsService.getTestById(getTestRequest.id)

   return rep.status(200).send()
}

export async function getAllTestByModuleId(req: FastifyRequest, rep: FastifyReply) {
   const getAllTestsRequest = req.params as { moduleId: string }

   await testsService.getAllTestsByModuleId(getAllTestsRequest.moduleId)

   return rep.status(202).send()
}

export async function createAnswer(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]

   const createAnswerRequest = answerSchema.parse(req.body)

   await testsService.createAnswer(authorization, createAnswerRequest)

   return rep.status(201).send()
}

export async function getAllAnswersByUserAndTestId(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]

   const testIdRequest = req.params as { testId: string }

   await testsService.getAllAnswersByUserAndTestId(authorization || ' ', testIdRequest.testId)
}