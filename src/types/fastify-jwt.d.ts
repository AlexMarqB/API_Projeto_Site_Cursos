// name.d.ts -> só aceita tipagem

import '@fastify/jwt'

declare module '@fastify/jwt' {
   export interface FastifyJWT {
      user: {
         sub: string;
         privilege: 'student' | 'administrator';
      }
   }
}