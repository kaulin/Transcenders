import { ApiResponseSchema } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { DatabaseManager } from '@transcenders/server-utils';
import { registerScoreRoutes } from './routes/score.routes';

const config: ServerConfig = {
  port: 3003,
  title: 'Score Service API',
  description: 'API for storing and retrieving score data',
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
  await registerScoreRoutes(fastify);

  await startServer(fastify, config);
}

start();
