import { ApiResponse } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { registerGatewayRoutes } from './routes/gateway.routes';

const config: ServerConfig = {
  port: 3004,
  title: 'Gateway Service API',
  description: 'Service to route traffic between web and backend services',
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.addSchema(ApiResponse);
  await registerGatewayRoutes(fastify);

  await startServer(fastify, config);
}

start();
