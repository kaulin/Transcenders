import {
  DeleteAvatarRequestParams,
  RandomCatsQuery,
  ResponseHelper,
  SetDefaultAvatarParams,
  SetDefaultAvatarRequest,
  UploadAvatarRequestParams,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AvatarService } from '../services/AvatarService';

export class AvatarController {
  static async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as UploadAvatarRequestParams;
      if (request.validationError) {
        // ignore validation for multipart, but set a schema for swagger
      }
      // Get the uploaded file
      const data = (await request.file())!;
      if (!data) {
        return ResponseHelper.error(reply, 'upload-avatar', 400, 'No file provided');
      }

      const result = await AvatarService.uploadAvatar(userId, data);
      return ResponseHelper.handleDatabaseResult(reply, result);
    } catch (error) {
      console.error('Avatar upload controller error:', error);
      return ResponseHelper.error(reply, 'upload-avatar', 500, 'Upload failed');
    }
  }

  static async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as DeleteAvatarRequestParams;
    const result = await AvatarService.deleteAvatar(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async getDefaultAvatars(request: FastifyRequest, reply: FastifyReply) {
    const result = await AvatarService.getDefaultAvatars();
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async getRandomCats(request: FastifyRequest, reply: FastifyReply) {
    const queryString = request.query as RandomCatsQuery;
    const result = await AvatarService.getRandomCatUrls(queryString);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async setDefaultAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as SetDefaultAvatarParams;
    const { avatarName } = request.body as SetDefaultAvatarRequest;

    const result = await AvatarService.setDefaultAvatar(userId, avatarName);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
