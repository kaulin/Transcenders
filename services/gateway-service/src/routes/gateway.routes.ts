import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GatewayService } from '../services/gateway.service';
import { verifyJwt } from '../middleware/jwt.middleware';

export default async function gatewayRoutes(fastify: FastifyInstance) {
  fastify.all(
    '/*',
    {
      preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        const exemptPaths = ['/auth/login', '/auth/register'];

        if (exemptPaths.includes(request.url)) {
          return;
        }

        await verifyJwt(request, reply);
      },
    },
    async (request, reply) => {
      await GatewayService.forward(request, reply);
    }
  );
}