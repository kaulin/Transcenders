import { DatabaseManager } from '@transcenders/server-utils';
import { FastifyInstance } from 'fastify';

export function registerOnCloseHook(fastify: FastifyInstance) {
  fastify.addHook('onClose', async () => {
    await DatabaseManager.closeAll();
    console.log('[onClose-hook] database connections closed');
  });
}
