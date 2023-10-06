import { FastifyInstance } from "fastify";
import { createAnswer, createTestController, getAllAnswersByUserAndTestId, getAllTestByModuleId, getTestById } from "../controller/tests.controller";

export async function testsRoutes(app: FastifyInstance) {
   app.post('/createTest', createTestController)
   app.get('/getTestById', getTestById)
   app.get('/getAllTest', getAllTestByModuleId)
   app.get('/createAnswer', createAnswer)
   app.get('/getAllAnswer', getAllAnswersByUserAndTestId)
}
