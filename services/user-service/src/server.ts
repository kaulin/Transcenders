import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { ApiResponse, AvatarConfig, UserConfig } from '@transcenders/contracts';
import { createFastifyServer, ServerConfig, startServer } from '@transcenders/fastify-server';
import path from 'path';
import { registerAdminRoutes } from './routes/admin.routes';
import { registerAvatarRoutes } from './routes/avatar.routes';
import { registerFriendshipRoutes } from './routes/friend.routes';
import { registerUserRoutes } from './routes/user.routes';
import { AdminService } from './services/AdminService';
import { AvatarService } from './services/AvatarService';

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
    root: path.join(import.meta.dirname, '../uploads'),
    prefix: '/uploads/',
    decorateReply: false, // Don't decorate reply object
  });

  // Hook to update userActivity #TODO move to gateway and use only on authenticated api calls
  // gateway will have a preValidation hook that authenticates token and also extracts userId from the token
  // and adds it to request.userId, for now just testing it via routes that have id params

  // fastify.addHook('preHandler', async (request) => {
  //   let userId: string | number | undefined;

  //   if (request.originalUrl.includes('/admin')) {
  //     return;
  //   }
  //   if (
  //     request.params &&
  //     typeof request.params === 'object' &&
  //     ('id' in request.params || 'userId' in request.params)
  //   ) {
  //     const params = request.params as { id?: string; userId?: string };
  //     userId = params.id ?? params.userId;
  //   }
  //   if (userId) {
  //     try {
  //       AdminService.updateUserActivity(+userId);
  //       console.log(`user <${userId}> activity updated`);
  //     } catch (error) {
  //       console.error('Failed to update user activity:', error);
  //     }
  //   }
  // });

  const cleanupInterval = setInterval(
    async () => {
      const result = await AdminService.cleanupOfflineUsers();
      if (result.success) {
        console.log(`cleanup result: ${result.data.message}`);
      }
    },
    UserConfig.CLEANUP_INTERVAL_MINUTES * 60 * 1000,
  );

  const shutdown = () => {
    clearInterval(cleanupInterval);
    fastify.close();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  await AvatarService.initializeAvatarDirectories();

  fastify.addSchema(ApiResponse);
  await registerAdminRoutes(fastify);
  await registerUserRoutes(fastify);
  await registerFriendshipRoutes(fastify);
  await registerAvatarRoutes(fastify);

  await startServer(fastify, config);
}

start();
