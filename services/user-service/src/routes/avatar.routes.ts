import {
  AVATAR_ROUTES,
  randomCatsRequestSchema,
  setDefaultAvatarSchema,
  standardApiResponses,
  uploadAvatarSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AvatarController } from '../controllers/AvatarController';

export async function registerAvatarRoutes(app: FastifyInstance) {
  app.post(
    AVATAR_ROUTES.UPLOAD,
    {
      schema: {
        description: 'Upload user avatar image',
        tags: ['Avatar'],
        consumes: ['multipart/form-data'],
        params: uploadAvatarSchema.params,
        body: uploadAvatarSchema.body,
        response: standardApiResponses,
      },
      attachValidation: true,
    },
    AvatarController.uploadAvatar,
  );

  // Get default avatars
  app.get(
    AVATAR_ROUTES.GET_DEFAULTS,
    {
      schema: {
        description: 'Get list of default avatar options',
        tags: ['Avatar'],
        response: standardApiResponses,
      },
    },
    AvatarController.getDefaultAvatars,
  );

  // Set default avatar
  app.post(
    AVATAR_ROUTES.SET_DEFAULT,
    {
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

  // Get default avatars
  app.get(
    AVATAR_ROUTES.GET_RANDOM,
    {
      schema: {
        description: 'get <count:number> random cats from TheCatApi',
        tags: ['Avatar'],
        querystring: randomCatsRequestSchema.querystring,
        response: standardApiResponses,
      },
    },
    AvatarController.getRandomCats,
  );
}
