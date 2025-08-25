import {
  AVATAR_ROUTES,
  deleteAvatarSchema,
  randomCatsRequestSchema,
  setDefaultAvatarSchema,
  standardApiResponses,
  uploadAvatarSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AvatarController } from '../controllers/AvatarController.js';

export async function registerAvatarRoutes(app: FastifyInstance) {
  app.put(
    AVATAR_ROUTES.USER_AVATAR,
    {
      preHandler: app.authenticate.owner('userId'),
      schema: {
        description: 'Upload or update user avatar image',
        tags: ['Avatar'],
        consumes: ['multipart/form-data'],
        params: uploadAvatarSchema.params,
        body: uploadAvatarSchema.body,
        response: standardApiResponses,
      },
      // Adding this actually disables the schema validation, and validates within the function
      attachValidation: true,
    },
    AvatarController.uploadAvatar,
  );

  app.delete(
    AVATAR_ROUTES.USER_AVATAR,
    {
      preHandler: app.authenticate.owner('userId'),
      schema: {
        description: 'Remove user avatar',
        tags: ['Avatar'],
        params: deleteAvatarSchema.params,
        response: standardApiResponses,
      },
    },
    AvatarController.deleteAvatar,
  );

  app.get(
    AVATAR_ROUTES.AVATARS_DEFAULTS,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get list of default avatar options',
        tags: ['Avatar'],
        response: standardApiResponses,
      },
    },
    AvatarController.getDefaultAvatars,
  );

  app.post(
    AVATAR_ROUTES.USER_AVATAR_DEFAULT,
    {
      preHandler: app.authenticate.owner('userId'),
      schema: {
        description: 'Set a default avatar for user',
        tags: ['Avatar'],
        params: setDefaultAvatarSchema.params,
        body: setDefaultAvatarSchema.body,
        response: standardApiResponses,
      },
    },
    AvatarController.setDefaultAvatar,
  );

  app.get(
    AVATAR_ROUTES.AVATARS_RANDOM,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get random cat avatars from TheCatApi',
        tags: ['Avatar'],
        querystring: randomCatsRequestSchema.querystring,
        response: standardApiResponses,
      },
    },
    AvatarController.getRandomCats,
  );
}
