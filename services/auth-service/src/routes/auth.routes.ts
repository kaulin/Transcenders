import {
  AUTH_ROUTES,
  changePasswordSchema,
  googleAuthCallbackSchema,
  googleFlowParamSchema,
  googleUserLogin,
  loginUserSchema,
  logoutUserSchema,
  refreshTokenRequestSchema,
  registerUserSchema,
  standardApiResponses,
  stepupRequestSchema,
  userIdParamSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

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
    AUTH_ROUTES.STEPUP,
    {
      schema: {
        description: 'Request an elevated token after step-up',
        tags: ['Auth'],
        params: userIdParamSchema,
        body: stepupRequestSchema,
        response: standardApiResponses,
      },
    },
    AuthController.stepup,
  );

  app.get(
    AUTH_ROUTES.GOOGLE_AUTH,
    {
      schema: {
        description: 'Redirects to Google OAuth with state',
        params: googleFlowParamSchema,
        tags: ['Auth-google'],
        response: standardApiResponses,
      },
    },
    AuthController.googleAuth,
  );

  app.get(
    AUTH_ROUTES.GOOGLE_CALLBACK,
    {
      schema: {
        description: 'Handle Google OAuth callback',
        tags: ['Auth-google'],
        querystring: googleAuthCallbackSchema,
        response: standardApiResponses,
      },
    },
    AuthController.googleCallback,
  );

  app.post(
    AUTH_ROUTES.GOOGLE_LOGIN,
    {
      schema: {
        description: 'Complete Google login with code',
        tags: ['Auth-google'],
        body: googleUserLogin,
        response: standardApiResponses,
      },
    },
    AuthController.googleLogin,
  );

  app.post(
    AUTH_ROUTES.GOOGLE_CONNECT,
    {
      schema: {
        description: 'Complete Google login with code',
        tags: ['Auth-google'],
        body: googleUserLogin,
        response: standardApiResponses,
      },
    },
    AuthController.googleConnect,
  );

  app.post(
    AUTH_ROUTES.LOGOUT,
    {
      schema: {
        description: 'logout user',
        tags: ['Auth'],
        body: logoutUserSchema,
        params: userIdParamSchema,
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
        params: userIdParamSchema,
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

  app.get(
    AUTH_ROUTES.CREDS,
    {
      schema: {
        description: 'get user creds info',
        tags: ['Auth'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    AuthController.getUserCredsInfo,
  );

  app.get(
    AUTH_ROUTES.ME,
    {
      schema: {
        description: 'Get current authenticated user profile',
        tags: ['Auth'],
        response: standardApiResponses,
      },
    },
    AuthController.getCurrentUser,
  );
}
