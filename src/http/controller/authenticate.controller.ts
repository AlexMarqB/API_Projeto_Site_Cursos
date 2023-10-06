import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import prisma from '../../lib/prisma'
import { AuthenticatedService } from '../../services/authenticate.service'
import { ConflictError } from '../../errors/conflict-error'
import { UsersService } from '../../services/users.service'
import setCookie from '@fastify/cookie'

export async function authenticateController (request: FastifyRequest, reply: FastifyReply) {

   const authenticateSchema = z.object({
      email: z.string().email(),
      password: z.string().min(10)
   })

   const { email, password } = authenticateSchema.parse(request.body)

   const prismaUsersRepository = new PrismaUsersRepository(prisma)
   const authenticatedService = new AuthenticatedService(prismaUsersRepository)

   try {
      const { user} = await authenticatedService.execute({email, password})

      const token = await reply.jwtSign({/*informações adicionais */},{
         //propriedades que dizem a respeito da pessoa que representa o token
         sign: {
            sub: user.id
         }
      })

      const refreshToken = await reply.jwtSign({}, {
         sign: {
            sub: user.id,
            expiresIn: '7d'
         }
      })

      return reply.setCookie('refreshToken', refreshToken, {
         path: '/',
         secure: true,
         sameSite: true,
         httpOnly: true
      }).status(200).send()
   } catch {
      throw new ConflictError('Unable to login')
   }
}

export async function profileController (req: FastifyRequest, rep: FastifyReply) {
   const prismaUsersRepository = new PrismaUsersRepository(prisma)
   const userService = new UsersService(prismaUsersRepository)

   try {
      const { user } = await userService.getMe(req.user.sub)

      return rep.status(201).send({
         user: {
            ...user,
            password: undefined,
         }
      })
   } catch (err) {

   }
}

export async function refreshController (req: FastifyRequest, rep: FastifyReply) {
   await req.jwtVerify({onlyCookie: true})
   const token = await rep.jwtSign({}, {
      sign: {
         sub: req.user.sub
      }
   })

   const refreshToken = await rep.jwtSign({}, {
      sign: {
         sub: req.user.sub,
         expiresIn: '7d'
      }
   })

   return rep.setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true
   }).status(200).send({
      token
   })
}