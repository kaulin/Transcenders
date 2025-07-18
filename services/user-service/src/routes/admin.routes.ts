import { ADMIN_ROUTES, standardApiResponses, userActivitySchema } from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController';

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
}
