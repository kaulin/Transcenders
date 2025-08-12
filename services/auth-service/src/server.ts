import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { registerAuthRoutes } from './routes/auth.routes.js';
import { registerTwoFactorRoutes } from './routes/twoFactor.routes.js';

const config: ServerConfig = {
  port: 3002,
  title: 'Auth Service API',
  description: 'API for user authorization (register, login, authorize)',
};

async function start() {
  const fastify = await createFastifyServer(config);

  await registerAuthRoutes(fastify);
  await registerTwoFactorRoutes(fastify);

  await startServer(fastify, config);
}

start();
