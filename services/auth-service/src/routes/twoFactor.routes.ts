import {
  TWO_FACTOR_ROUTES,
  standardApiResponses,
  twoFactorRequestSchema,
  twoFactorVerifySchema,
  userIdParamSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { TwoFactorController } from '../controllers/twoFactor.controller.js';

export async function registerTwoFactorRoutes(app: FastifyInstance) {
  app.post(
    TWO_FACTOR_ROUTES.REQUEST_ENROLL,
    {
      preHandler: app.authenticate.owner('id'),
      schema: {
        description: 'Start 2FA enrollment (send code)',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorRequestSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.requestEnroll,
  );

  app.post(
    TWO_FACTOR_ROUTES.ENABLE,
    {
      preHandler: app.authenticate.owner('id'),
      schema: {
        description: 'Verify 2FA enrollment code',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorVerifySchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.enable,
  );

  app.post(
    TWO_FACTOR_ROUTES.REQUEST_STEPUP,
    {
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
    TWO_FACTOR_ROUTES.LOGIN,
    {
      preHandler: app.authenticate.owner('id'),
      schema: {
        description: 'Verify 2FA login code',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        body: twoFactorVerifySchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.login,
  );

  app.post(
    TWO_FACTOR_ROUTES.REQUEST_DISABLE,
    {
      preHandler: app.authenticate.stepup('id'),
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
      preHandler: app.authenticate.stepup('id'),
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

  app.get(
    TWO_FACTOR_ROUTES.ENABLED,
    {
      preHandler: app.authenticate.owner('id'),
      schema: {
        description: 'Is 2FA enabled for this user?',
        tags: ['Auth-2FA'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    TwoFactorController.enabled,
  );
}
