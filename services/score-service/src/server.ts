import { ApiResponseSchema } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { registerScoreRoutes } from './routes/score.routes.js';

const config: ServerConfig = {
  port: 3003,
  title: 'Score Service API',
  description: 'API for storing and retrieving score data',
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.addSchema(ApiResponseSchema);
  await registerScoreRoutes(fastify);

  await startServer(fastify, config);
}

start();
