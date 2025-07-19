import {
  ApiErrorHandler,
  DeleteAvatarRequestParams,
  ERROR_CODES,
  RandomCatsQuery,
  ResultHelper,
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
        return ApiErrorHandler.error(reply, ERROR_CODES.USER.FILE_NOT_PROVIDED, 'upload avatar');
      }

      const result = await AvatarService.uploadAvatar(userId, data);
      return ApiErrorHandler.handleServiceResult(reply, result);
    } catch (error) {
      const errorResult = ResultHelper.errorFromException(error, 'upload avatar');
      return ApiErrorHandler.handleServiceResult(reply, errorResult);
    }
  }

  static async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as DeleteAvatarRequestParams;
    const result = await AvatarService.deleteAvatar(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getDefaultAvatars(request: FastifyRequest, reply: FastifyReply) {
    const result = await AvatarService.getDefaultAvatars();
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getRandomCats(request: FastifyRequest, reply: FastifyReply) {
    const queryString = request.query as RandomCatsQuery;
    const result = await AvatarService.getRandomCatUrls(queryString);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async setDefaultAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as SetDefaultAvatarParams;
    const { avatarName } = request.body as SetDefaultAvatarRequest;

    const result = await AvatarService.setDefaultAvatar(userId, avatarName);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
