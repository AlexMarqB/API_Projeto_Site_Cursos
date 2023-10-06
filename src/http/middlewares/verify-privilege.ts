import { FastifyRequest, FastifyReply } from 'fastify'

export function verifyPrivilege(privilegeVerify: string) {
   return async (req: FastifyRequest, rep: FastifyReply) => {
      const { privilege } = req.user

      if(privilege !== privilegeVerify) {
         return rep.status(401).send({ message: 'Unhauthorized'})
      }
   }
}