import { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../../errors/unauthorized-error'

export async function verifyJwt(req: FastifyRequest, rep: FastifyReply) {
   try {
      await req.jwtVerify()
   } catch (err) {
      return rep.status(401).send({message: 'Unauthorized'})
   }
}
