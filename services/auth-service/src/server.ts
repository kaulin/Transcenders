import { ApiResponseSchema } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { DatabaseManager } from '@transcenders/server-utils';
import { registerAuthRoutes } from './routes/auth.routes.js';

const config: ServerConfig = {
  port: 3002,
  title: 'Auth Service API',
  description: 'API for user authorization (register, login, authorize)',
  shutdown: {
    onShutdown: async () => {
      console.log('Cleaning up user service resources...');
      await DatabaseManager.closeAll();
    },
  },
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.addSchema(ApiResponseSchema);
  await registerAuthRoutes(fastify);

  await startServer(fastify, config);
}

start();
