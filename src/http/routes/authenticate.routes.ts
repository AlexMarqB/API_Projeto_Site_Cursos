import { FastifyInstance} from 'fastify'
import { authenticateController } from '../controller/authenticate.controller'
import { verifyJwt } from '../middlewares/verify-jwt'

export async function authenticateRoutes(router: FastifyInstance) {
   router.post('/create', {onRequest: [verifyJwt]} ,authenticateController)
}