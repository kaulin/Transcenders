import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { ENV } from '@transcenders/server-utils';
import { registerScoreRoutes } from './routes/score.routes.js';

const config: ServerConfig = {
  port: ENV.PORT ?? 3003,
  title: 'Score Service API',
  description: 'API for storing and retrieving score data',
};

async function start() {
  const fastify = await createFastifyServer(config);

  await registerScoreRoutes(fastify);

  await startServer(fastify, config);
}

start();
