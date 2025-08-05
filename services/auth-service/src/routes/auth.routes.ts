import {
  AUTH_ROUTES,
  changePasswordSchema,
  googleAuthCallbackSchema,
  googleFlowParamSchema,
  googleUserLogin,
  googleUserSetPasswordSchema,
  loginUserSchema,
  logoutUserSchema,
  refreshTokenRequestSchema,
  registerUserSchema,
  standardApiResponses,
  twoFactorEnableSchema,
  twoFactorVerifySchema,
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
        params: userIdParamSchema,
        body: googleUserLogin,
        response: standardApiResponses,
      },
    },
    AuthController.googleLogin,
  );

  app.post(
    AUTH_ROUTES.GOOGLE_SET_PASSWORD,
    {
      schema: {
        description: 'Set password for Google user with code',
        tags: ['Auth-google'],
        params: userIdParamSchema,
        body: googleUserSetPasswordSchema,
        response: standardApiResponses,
      },
    },
    AuthController.googleSetPassword,
  );

  app.post(
    AUTH_ROUTES.GOOGLE_VERIFY_CONFIG,
    {
      schema: {
        description: 'Verify Google auth for sensitive operations',
        tags: ['Auth-google'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    AuthController.googleVerifyConfig,
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

  app.put(
    AUTH_ROUTES.TWO_FACTOR_ENABLE,
    {
      schema: {
        description: 'Creates or replaces 2FA setup',
        tags: ['Auth'],
        params: userIdParamSchema,
        body: twoFactorEnableSchema,
        response: standardApiResponses,
      },
    },
    AuthController.twoFactorEnable,
  );

  app.patch(
    AUTH_ROUTES.TWO_FACTOR_VERIFY,
    {
      schema: {
        description: 'Updates status from pending to verified',
        tags: ['Auth'],
        params: userIdParamSchema,
        body: twoFactorVerifySchema,
        response: standardApiResponses,
      },
    },
    AuthController.twoFactorVerify,
  );

  app.delete(
    AUTH_ROUTES.TWO_FACTOR_DISABLE,
    {
      schema: {
        description: 'Removes 2FA (deletes the record)',
        tags: ['Auth'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    AuthController.twoFactorDisable,
  );
}
