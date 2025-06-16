import {
  AUTH_ROUTES,
  loginUserSchema,
  registerUserSchema,
  standardApiResponses,
  updateUserCredentialsSchema,
  userByIdSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post(
    AUTH_ROUTES.REGISTER,
    {
      schema: {
        description: 'Authenticate something',
        tags: ['Auth'],
        body: registerUserSchema,
        response: standardApiResponses,
      },
    },
    AuthController.register,
  );

  app.post(
    AUTH_ROUTES.LOGIN,
    {
      schema: {
        description: 'Authenticate something',
        tags: ['Auth'],
        body: loginUserSchema,
        response: standardApiResponses,
      },
    },
    AuthController.login,
  );
  app.patch(
    AUTH_ROUTES.UPDATE,
    {
      schema: {
        description: 'update user credentials',
        tags: ['Auth'],
        params: updateUserCredentialsSchema.params,
        response: standardApiResponses,
      },
    },
    AuthController.update,
  );
  app.delete(
    AUTH_ROUTES.DELETE,
    {
      schema: {
        description: 'remove user credentials',
        tags: ['Internal ONLY'],
        params: userByIdSchema.params,
        response: standardApiResponses,
      },
    },
    AuthController.delete,
  );
}
