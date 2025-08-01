import { ApiResponseSchema } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { registerScoreRoutes } from './routes/score.routes.js';

// #TODO all ports from env
const config: ServerConfig = {
  port: 3003,
  title: 'Score Service API',
  description: 'API for storing and retrieving score data',
};

async function start() {
  const fastify = await createFastifyServer(config);

  await registerScoreRoutes(fastify);

  await startServer(fastify, config);
}

start();
