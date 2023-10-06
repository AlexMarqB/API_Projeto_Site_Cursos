import { z } from "zod";
import { ModulesService } from "../../services/modules.service";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import prisma from "../../lib/prisma";
import { PrismaCoursesRepository } from "../../repositories/prisma/prisma-courses-repository";
import { PrismaModulesRepository } from "../../repositories/prisma/prisma-modules-repository";
import { PrismaEnrollmentsRepository } from "../../repositories/prisma/prisma-enrollments-repository";
import { FastifyReply, FastifyRequest } from "fastify";

const moduleSchema = z.object({
   courseId: z.string(),
   name: z.string(),
   description: z.string().min(10),
})

const modulesService = new ModulesService(new PrismaUsersRepository(prisma), new PrismaCoursesRepository(prisma), new PrismaModulesRepository(prisma), new PrismaEnrollmentsRepository(prisma))

export async function createModule(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]!

   const refCourse = await req.params as { courseId: string }

   const createModuleRequest = moduleSchema.parse(req.body)

   await modulesService.createModule(authorization, refCourse.courseId, createModuleRequest)

   return rep.status(201).send()
}

export async function getModuleById(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]!

   const refModule = await req.params as { moduleId: string }

   await modulesService.getModuleById(authorization, refModule.moduleId)

   return rep.status(201).send()
}

export async function getModulesByCourseId(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]!

   const refCourse = await req.params as { courseId: string }

   await modulesService.getModulesByCourseId(authorization, refCourse.courseId)

   return rep.status(201).send()
}

export async function updateModuleById(req: FastifyRequest, rep: FastifyReply) {
   const authorization = req.headers.authorization?.split(' ')[1]!

   const refModule = await req.params as { moduleId: string }

   const updateModSchema = z.object({
      name: z.string(),
      description: z.string().min(10),
   })

   const updateModRequest = updateModSchema.parse(req.body)

   await modulesService.updateModuleById(authorization, refModule.moduleId, updateModRequest)

   return rep.status(201).send()
}

