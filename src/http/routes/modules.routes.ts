import { FastifyInstance } from "fastify";
import { createModule, getModuleById, getModulesByCourseId, updateModuleById } from "../controller/modules.controller";


export async function modulesRoutes(app: FastifyInstance) {
   app.post('create', createModule)
   app.get('getModule', getModuleById)
   app.get('getModuleByCourseId', getModulesByCourseId)
   app.put('updateModule', updateModuleById)
}