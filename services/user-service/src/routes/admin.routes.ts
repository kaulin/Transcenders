import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/health', AdminController.getHealth);
  app.get('/db', AdminController.testDatabase);
  console.log('Admin routes registered');
}
