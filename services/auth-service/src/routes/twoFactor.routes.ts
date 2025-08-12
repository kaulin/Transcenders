import {
  TWO_FACTOR_ROUTES,
  standardApiResponses,
  twoFactorEnableSchema,
  twoFactorVerifySchema,
  userIdParamSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { TwoFactorController } from '../controllers/twoFactor.controller.js';

export async function registerTwoFactorRoutes(app: FastifyInstance) {
  app.post(
    TWO_FACTOR_ROUTES.REQUEST_ENROLL,
    {
      schema: {
        description: 'Start 2FA enrollment (send code)',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorEnableSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.enroll,
  );

  app.post(
    TWO_FACTOR_ROUTES.ENROLL,
    {
      schema: {
        description: 'Verify 2FA enrollment code',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorVerifySchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.verifyEnroll,
  );

  app.post(
    TWO_FACTOR_ROUTES.REQUEST_STEPUP,
    {
      schema: {
        description: 'Request a step-up 2FA challenge',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.requestStepup,
  );

  app.post(
    TWO_FACTOR_ROUTES.REQUEST_LOGIN,
    {
      schema: {
        description: 'Request a login-time 2FA challenge',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.requestLogin,
  );

  app.post(
    TWO_FACTOR_ROUTES.REQUEST_DISABLE,
    {
      schema: {
        description: 'Request a disable 2FA challenge',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.requestDisable,
  );

  app.post(
    TWO_FACTOR_ROUTES.DISABLE,
    {
      schema: {
        description: 'Disable 2FA after verifying challenge code',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorVerifySchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.disable,
  );
}
