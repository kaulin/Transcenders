import { AUTH_ROUTES, authRouteSchemas } from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    AUTH_ROUTES.REGISTER,
    {
      schema: authRouteSchemas.register,
    },
    AuthController.register,
  );

  fastify.post(
    AUTH_ROUTES.LOGIN,
    {
      schema: authRouteSchemas.login,
    },
    AuthController.login,
  );

  fastify.delete(
    AUTH_ROUTES.DELETE,
    {
      schema: authRouteSchemas.delete,
    },
    AuthController.delete,
  );

  fastify.patch(
    AUTH_ROUTES.CHANGE_PASSWORD,
    {
      schema: authRouteSchemas.changePassword,
    },
    AuthController.changePassword,
  );
}
