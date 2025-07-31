import {
  ADMIN_ROUTES,
  cleanupOfflineUsersSchema,
  standardApiResponses,
  userActivitySchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/health', AdminController.getHealth);
  app.post(
    ADMIN_ROUTES.ACTIVITY,
    {
      schema: {
        description: 'Update user activity',
        tags: ['Admin'],
        params: userActivitySchema.params,
        response: standardApiResponses,
      },
    },
    AdminController.updateUserActivity,
  );

  app.post(
    ADMIN_ROUTES.CLEANUP_OFFLINE,
    {
      schema: {
        description: 'Set offline/idle users offline',
        tags: ['Admin'],
        querystring: cleanupOfflineUsersSchema.querystring,
        response: standardApiResponses,
      },
    },
    AdminController.cleanupOfflineUsers,
  );
}
