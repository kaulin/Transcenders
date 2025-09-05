import { ApiErrorHandler, CookieUtils } from '@transcenders/server-utils';
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const result = ApiErrorHandler.errorFromFastify(reply, error, 'fastify error handler');
      if (!result.success && result.error.httpStatus == 410) {
        CookieUtils.clearCookies(reply);
      }
      return result;
    },
  );
}
