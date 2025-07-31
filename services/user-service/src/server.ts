import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { AvatarConfig } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import { ENV } from '@transcenders/server-utils';
import path from 'path';
import { registerAdminRoutes } from './routes/admin.routes.js';
import { registerAvatarRoutes } from './routes/avatar.routes.js';
import { registerFriendshipRoutes } from './routes/friend.routes.js';
import { registerUserRoutes } from './routes/user.routes.js';
import { AvatarService } from './services/AvatarService.js';

const config: ServerConfig = {
  port: 3001,
  title: 'User Service API',
  description: 'API for user management and friendships',
};

async function start() {
  const fastify = await createFastifyServer(config);

  fastify.register(multipart, {
    limits: {
      fileSize: AvatarConfig.MAX_FILE_SIZE,
      files: 1,
    },
  });

  fastify.register(staticFiles, {
    root: path.join(ENV.PROJECT_ROOT, AvatarService.getMediaDir()),
    prefix: AvatarConfig.MEDIA_DIR,
    decorateReply: false,
  });

  await AvatarService.initializeAvatarDirectories();

  await registerAdminRoutes(fastify);
  await registerUserRoutes(fastify);
  await registerFriendshipRoutes(fastify);
  await registerAvatarRoutes(fastify);

  await startServer(fastify, config);
}

start();
