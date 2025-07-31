import { FastifyInstance } from 'fastify';
import gracefulShutdown from 'fastify-graceful-shutdown';
import { ServerConfig } from '../types/server.config.js';

export async function setupGracefulShutdown(
  fastify: FastifyInstance,
  config: ServerConfig,
): Promise<void> {
  await fastify.register(gracefulShutdown);

  fastify.after(() => {
    console.log('[DEBUG] Setting up graceful shutdown handler...');

    fastify.gracefulShutdown(async (signal) => {
      console.log('[SHUTDOWN] Handler called with signal:', signal);
      console.log('[SHUTDOWN] Starting shutdown process...');

      if (config.shutdown?.onShutdown) {
        console.log('[SHUTDOWN] Running custom shutdown routine...');
        try {
          await config.shutdown.onShutdown();
          console.log('[SHUTDOWN] Custom shutdown completed');
        } catch (error) {
          console.error('[SHUTDOWN] Error in custom shutdown:', error);
        }
      }

      console.log('[SHUTDOWN] Graceful shutdown completed');
    });
  });
}
