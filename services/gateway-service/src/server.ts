import { ApiResponse } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import scoreRoutes from './routes/score.routes';

const config: ServerConfig = {
  port: 3004,
  title: 'Gateway Service API',
  description: 'Service to route traffic between web and backend services',
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.addSchema(ApiResponse);
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(scoreRoutes);

  await startServer(fastify, config);
}

start();
