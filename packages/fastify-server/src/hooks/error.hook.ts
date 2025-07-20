import { ApiErrorHandler } from '@transcenders/contracts';
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const result = ApiErrorHandler.errorFromFastify(reply, error, 'fastify error handler');
      return result;
    },
  );
}
