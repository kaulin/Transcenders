import { AVATAR_ROUTES, standardApiResponses, uploadAvatarSchema } from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { Avatarcontroller } from '../controllers/AvatarController';

export async function registerAvatarRoutes(app: FastifyInstance) {
  app.post(
    AVATAR_ROUTES.UPLOAD,
    {
      schema: {
        description: 'Upload user avatar image',
        tags: ['User'],
        consumes: ['multipart/form-data'],
        params: uploadAvatarSchema.params,
        response: standardApiResponses,
      },
    },
    Avatarcontroller.uploadAvatar,
  );
}
