import {
  AUTH_ROUTES,
  changePasswordSchema,
  loginUserSchema,
  logoutUserSchema,
  refreshTokenRequestSchema,
  registerUserSchema,
  standardApiResponses,
  userByIdSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

// #TODO api-client helpers for setting up refresh token cycling
// #TODO google sign in
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

  app.post(
    AUTH_ROUTES.LOGOUT,
    {
      schema: {
        description: 'logout user',
        tags: ['Auth'],
        body: logoutUserSchema,
        param: userByIdSchema,
        response: standardApiResponses,
      },
    },
    AuthController.logout,
  );

  app.post(
    AUTH_ROUTES.REFRESH,
    {
      schema: {
        description: 'Refresh Access Token',
        tags: ['Auth'],
        body: refreshTokenRequestSchema,
        response: standardApiResponses,
      },
    },
    AuthController.refresh,
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

  app.patch(
    AUTH_ROUTES.CHANGE_PASSWORD,
    {
      schema: {
        description: 'change user password',
        tags: ['Auth'],
        params: changePasswordSchema.params,
        body: changePasswordSchema.body,
        response: standardApiResponses,
      },
    },
    AuthController.changePassword,
  );
}
