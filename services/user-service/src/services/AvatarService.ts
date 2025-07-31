import { MultipartFile } from '@fastify/multipart';
import {
  AvatarConfig,
  AvatarResult,
  DefaultAvatarsResult,
  ERROR_CODES,
  RandomAvatarResult,
  RandomCatsQuery,
  ResultHelper,
  ServiceError,
  ServiceResult,
} from '@transcenders/contracts';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { UserService } from './UserService.js';

export class AvatarService {
  private static getUploadDir(): string {
    return path.join(import.meta.dirname, '../../uploads/avatars');
  }

  private static getDefaultAvatarsDir(): string {
    return path.join(import.meta.dirname, '../../uploads/default-avatars');
  }

  private static async removeOldAvatar(uploadDir: string, userId: string): Promise<void> {
    try {
      const files = fs.readdirSync(uploadDir);
      const userFiles = files.filter((file) => file.startsWith(`${userId}.`));

      for (const file of userFiles) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    } catch (error) {
      // Ignore errors
    }
  }

  static async initializeAvatarDirectories(): Promise<void> {
    const uploadDir = this.getUploadDir();
    const defaultAvatarsDir = this.getDefaultAvatarsDir();

    // Ensure upload directories exist
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(defaultAvatarsDir, { recursive: true });
  }

  private static async processAndSaveAvatar(userId: string, inputBuffer: Buffer): Promise<string> {
    const uploadDir = this.getUploadDir();
    await this.removeOldAvatar(uploadDir, userId);

    const filename = `${userId}.${AvatarConfig.OUTPUT_FORMAT}`;
    const filePath = path.join(uploadDir, filename);

    await sharp(inputBuffer)
      .resize(AvatarConfig.WIDTH, AvatarConfig.HEIGHT, AvatarConfig.RESIZE_OPTIONS)
      .webp(AvatarConfig.WEBP_OPTIONS)
      .toFile(filePath);

    return `/uploads/avatars/${filename}`;
  }

  static async uploadAvatar(
    userId: string,
    file: MultipartFile,
  ): Promise<ServiceResult<AvatarResult>> {
    return ResultHelper.executeOperation<AvatarResult>('upload avatar', async () => {
      if (!file.mimetype.startsWith('image/')) {
        throw new ServiceError(ERROR_CODES.USER.INVALID_FILE_TYPE, {
          providedType: file.mimetype,
          allowedTypes: ['image/*'],
        });
      }

      const inputBuffer = await file.toBuffer();

      // process image and save to uploads
      const avatarPath = await this.processAndSaveAvatar(userId, inputBuffer);

      // Update database
      const updateResult = await UserService.updateUser(+userId, { avatar: avatarPath });
      if (!updateResult.success) {
        throw new ServiceError(ERROR_CODES.USER.AVATAR_UPLOAD_FAILED, {
          reason: 'Failed to update user avatar in database',
        });
      }

      return {
        url: avatarPath,
      };
    });
  }

  static async deleteAvatar(userId: string): Promise<ServiceResult<AvatarResult>> {
    return ResultHelper.executeOperation<AvatarResult>('delete user avatar', async () => {
      await this.removeOldAvatar(this.getUploadDir(), userId);

      // Reset user avatar to default
      const defaultAvatarUrl = `/uploads/default-avatars/${AvatarConfig.DEFAULT_AVATAR.FILENAME}`;
      const updateResult = await UserService.updateUser(+userId, { avatar: defaultAvatarUrl });

      if (!updateResult.success) {
        throw new ServiceError(ERROR_CODES.USER.AVATAR_UPLOAD_FAILED, {
          reason: 'Failed to reset user avatar to default',
        });
      }

      return {
        url: defaultAvatarUrl,
      };
    });
  }

  static async getDefaultAvatars(): Promise<ServiceResult<DefaultAvatarsResult>> {
    return ResultHelper.executeOperation<DefaultAvatarsResult>('get default avatars', async () => {
      const defaultAvatarsDir = this.getDefaultAvatarsDir();
      const files = fs.readdirSync(defaultAvatarsDir);

      const avatars = files
        .filter((file) => file.startsWith(AvatarConfig.DEFAULT_AVATAR.PREFIX_FILTER))
        .map((file) => ({
          name: file,
          url: `/uploads/default-avatars/${file}`,
        }));

      const result: DefaultAvatarsResult = { avatars };
      return result;
    });
  }

  static async setDefaultAvatar(
    userId: string,
    avatarName: string = AvatarConfig.DEFAULT_AVATAR.FILENAME,
  ): Promise<ServiceResult<AvatarResult>> {
    return ResultHelper.executeOperation<AvatarResult>('set default avatar', async () => {
      const defaultAvatarsDir = this.getDefaultAvatarsDir();

      // Validate avatar exists
      const avatarPath = path.join(defaultAvatarsDir, avatarName);
      if (!fs.existsSync(avatarPath)) {
        throw new ServiceError(ERROR_CODES.COMMON.RESOURCE_NOT_FOUND, {
          resourceType: 'avatar',
          avatarName,
        });
      }

      // Update user's avatar in database
      const avatarUrl = `/uploads/default-avatars/${avatarName}`;

      const updateResult = await UserService.updateUser(+userId, { avatar: avatarUrl });
      if (!updateResult.success) {
        throw new ServiceError(ERROR_CODES.USER.AVATAR_UPLOAD_FAILED, {
          reason: 'Failed to set default avatar in database',
        });
      }

      await this.removeOldAvatar(this.getUploadDir(), userId);

      return {
        url: avatarUrl,
      };
    });
  }

  static async getRandomCatUrls({
    limit = AvatarConfig.RANDOM_CATS.DEFAULT_LIMIT,
    imageSize = AvatarConfig.RANDOM_CATS.DEFAULT_IMAGE_SIZE,
    mimeTypes = AvatarConfig.RANDOM_CATS.DEFAULT_MIME_TYPES,
  }: Partial<RandomCatsQuery> = {}): Promise<ServiceResult<RandomAvatarResult[]>> {
    return ResultHelper.executeOperation<RandomAvatarResult[]>('get random cat urls', async () => {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      const requestOptions: RequestInit = {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      };

      // Use configurable API URL
      const response = await fetch(
        `${AvatarConfig.RANDOM_CATS.API_URL}?&size=${imageSize}&mime_types=${mimeTypes}&format=json&order=RANDOM&page=0&limit=${limit}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error(`Cat API error: ${response.status}`);
      }

      const catData = await response.json();

      if (!catData || catData.length === 0) {
        throw new Error('No cat images found');
      }

      const cats: RandomAvatarResult[] = catData.map((cat: RandomAvatarResult) => ({
        url: cat.url,
        id: cat.id,
        width: cat.width,
        height: cat.height,
      }));

      return cats;
    });
  }
}
