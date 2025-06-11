import { ApiResponse } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { registerAdminRoutes } from './routes/admin.routes';
import { registerFriendshipRoutes } from './routes/friend.routes';
import { registerUserRoutes } from './routes/user.routes';

const config: ServerConfig = {
  port: 3001,
  title: 'User Service API',
  description: 'API for user management and friendships',
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.addSchema(ApiResponse);
  await registerAdminRoutes(fastify);
  await registerUserRoutes(fastify);
  await registerFriendshipRoutes(fastify);

  await startServer(fastify, config);
}

start();
