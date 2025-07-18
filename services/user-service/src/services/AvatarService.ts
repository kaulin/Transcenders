import { MultipartFile } from '@fastify/multipart';
import {
  AvatarConfig,
  AvatarResult,
  DatabaseHelper,
  DatabaseResult,
  DefaultAvatarsResult,
  RandomAvatarResult,
  RandomCatsQuery,
} from '@transcenders/contracts';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getDB } from '../db/database';
import { UserService } from './UserService';

export class AvatarService {
  private static getUploadDir(): string {
    return path.join(import.meta.dirname, '../../uploads/avatars');
  }

  private static getDefaultAvatarsDir(): string {
    return path.join(import.meta.dirname, '../../uploads/default-avatars');
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
  ): Promise<DatabaseResult<AvatarResult>> {
    return DatabaseHelper.executeQuery<AvatarResult>('upload avatar', await getDB(), async () => {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      const inputBuffer = await file.toBuffer();
      const avatarPath = await this.processAndSaveAvatar(userId, inputBuffer);

      // Update database
      await UserService.updateUser(+userId, { avatar: avatarPath });

      return {
        success: true,
        url: avatarPath,
      };
    });
  }

  static async deleteAvatar(userId: string): Promise<DatabaseResult<AvatarResult>> {
    return DatabaseHelper.executeQuery<AvatarResult>(
      'delete user avatar',
      await getDB(),
      async () => {
        await this.removeOldAvatar(this.getUploadDir(), userId);

        // Reset user avatar to default
        const defaultAvatarUrl = `/uploads/default-avatars/${AvatarConfig.DEFAULT_AVATAR.FILENAME}`;
        await UserService.updateUser(+userId, { avatar: defaultAvatarUrl });

        return {
          success: true,
          url: defaultAvatarUrl,
        };
      },
    );
  }

  static async getDefaultAvatars(): Promise<DatabaseResult<DefaultAvatarsResult>> {
    try {
      const defaultAvatarsDir = this.getDefaultAvatarsDir();
      const files = fs.readdirSync(defaultAvatarsDir);

      const avatars = files
        .filter((file) => file.startsWith(AvatarConfig.DEFAULT_AVATAR.PREFIX_FILTER))
        .map((file) => ({
          name: file,
          url: `/uploads/default-avatars/${file}`,
        }));

      const result: DefaultAvatarsResult = { avatars };
      return DatabaseHelper.success(result);
    } catch (error) {
      console.error('Error getting default avatars:', error);
      return DatabaseHelper.error('Failed to get default avatars');
    }
  }

  static async setDefaultAvatar(
    userId: string,
    avatarName: string = AvatarConfig.DEFAULT_AVATAR.FILENAME,
  ): Promise<DatabaseResult<AvatarResult>> {
    const defaultAvatarsDir = this.getDefaultAvatarsDir();
    return DatabaseHelper.executeQuery<AvatarResult>(
      'set default avatar',
      await getDB(),
      async () => {
        // Validate avatar exists
        const avatarPath = path.join(defaultAvatarsDir, avatarName);
        if (!fs.existsSync(avatarPath)) {
          throw new Error('Avatar not found');
        }

        // Update user's avatar in database
        const avatarUrl = `/uploads/default-avatars/${avatarName}`;

        await UserService.updateUser(+userId, {
          avatar: avatarUrl,
        });
        await this.removeOldAvatar(this.getUploadDir(), userId);

        const result: AvatarResult = {
          success: true,
          url: avatarUrl,
        };

        return result;
      },
    );
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

  static async getRandomCatUrls({
    limit = AvatarConfig.RANDOM_CATS.DEFAULT_LIMIT,
    imageSize = AvatarConfig.RANDOM_CATS.DEFAULT_IMAGE_SIZE,
    mimeTypes = AvatarConfig.RANDOM_CATS.DEFAULT_MIME_TYPES,
  }: Partial<RandomCatsQuery> = {}): Promise<DatabaseResult<RandomAvatarResult[]>> {
    try {
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

      return DatabaseHelper.success(cats);
    } catch (error) {
      console.error('Error getting random cats:', error);
      return DatabaseHelper.error('Error getting random cats:');
    }
  }
}
