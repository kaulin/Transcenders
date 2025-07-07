import { ApiResponse } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import authRoutes from './routes/auth.routes';

const config: ServerConfig = {
  port: 3002,
  title: 'Auth Service API',
  description: 'API for user authorization (register, login, authorize)',
};

async function start() {
  const fastify = await createFastifyServer(config);
  fastify.addSchema(ApiResponse);
  await fastify.register(authRoutes);
  await startServer(fastify, config);
}

start();
