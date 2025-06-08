import { AUTH_ROUTES } from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get(
    AUTH_ROUTES.AUTH,
    {
      schema: {
        description: 'Authenticate something',
        tags: ['Auth'],
      },
    },
    AuthController.auth,
  );
}
