import { MultipartFile } from '@fastify/multipart';
import { ResponseHelper, UploadAvatarRequestParams } from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AvatarService } from '../services/AvatarService';
export class Avatarcontroller {
  static async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as UploadAvatarRequestParams;
      const data = (await request.file()) as MultipartFile;
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
}
