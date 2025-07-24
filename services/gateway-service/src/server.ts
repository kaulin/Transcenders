import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import gatewayRoutes from './routes/gateway.routes';

const config: ServerConfig = {
  port: 4000,
  title: 'Gateway Service API',
  description: 'Routes traffic from client to services and handles JWT validation',
};

async function start() {
  const fastify = await createFastifyServer(config);

  await fastify.register(validateJWT); // TODO
  await fastify.register(gatewayRoutes);
  await startServer(fastify, config);
}

start();
