import { ENV } from '@transcenders/server-utils';
import { FastifyInstance } from 'fastify';

export function registerDevelopmentHooks(fastify: FastifyInstance) {
  if (ENV.NODE_ENV === 'development') {
    fastify.addHook('onSend', async (request, reply, payload) => {
      try {
        const parsed = JSON.parse(payload as string);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return payload;
      }
    });
  }
}
