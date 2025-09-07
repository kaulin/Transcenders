import {
  AUTH_ROUTES,
  changePasswordSchema,
  googleAuthCallbackSchema,
  googleFlowParamSchema,
  googleUserLogin,
  loginUserSchema,
  registerUserSchema,
  standardApiResponses,
  stepupRequestSchema,
  userIdParamSchema,
} from '@transcenders/contracts';
import { CookieUtils } from '@transcenders/server-utils';
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post(
    AUTH_ROUTES.REGISTER,
    {
      preHandler: app.authenticate.none(),
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
      preHandler: app.authenticate.none(),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.none(),
      schema: {
        description: 'Redirects to Google OAuth with state',
        params: googleFlowParamSchema,
        tags: ['Auth-google'],
        response: standardApiResponses,
      },
    },
    AuthController.googleAuth,
  );

  //TODO fix this route to go through gateway also, and requre a cookie from google callback
  app.get(
    AUTH_ROUTES.GOOGLE_CALLBACK,
    {
      preHandler: app.authenticate.none(),
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
      preHandler: app.authenticate.none(),
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
      preHandler: app.authenticate.owner('id'),
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
      preValidation: [CookieUtils.requireCsrf(), CookieUtils.requireRefreshToken()],
      preHandler: app.authenticate.owner('id'),
      schema: {
        description: 'logout user',
        tags: ['Auth'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    AuthController.logout,
  );

  app.post(
    AUTH_ROUTES.REFRESH,
    {
      preValidation: [CookieUtils.requireCsrf(), CookieUtils.requireRefreshToken()],
      preHandler: app.authenticate.none(),
      schema: {
        description: 'Refresh Access Token',
        tags: ['Auth'],
        response: standardApiResponses,
      },
    },
    AuthController.refresh,
  );

  app.delete(
    AUTH_ROUTES.DELETE,
    {
      preHandler: app.authenticate.stepup('id'),
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
      preHandler: app.authenticate.stepup('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get current authenticated user profile',
        tags: ['Auth'],
        response: standardApiResponses,
      },
    },
    AuthController.getCurrentUser,
  );
}
