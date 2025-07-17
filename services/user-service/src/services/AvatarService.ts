import { MultipartFile } from '@fastify/multipart';
import {
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
import { pipeline } from 'stream';
import { promisify } from 'util';
import { getDB } from '../db/database';
import { UserService } from './UserService';

const pump = promisify(pipeline);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

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

    // Standardize all avatars to .webp
    const filename = `${userId}.webp`;
    const filePath = path.join(uploadDir, filename);

    // Process with Sharp and save the file #TODO change hardcoded image conversion sizes and settings
    await sharp(inputBuffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(filePath);

    return `/uploads/avatars/${filename}`;
  }

  static async uploadAvatar(
    userId: string,
    file: MultipartFile,
  ): Promise<DatabaseResult<AvatarResult>> {
    return DatabaseHelper.executeQuery<AvatarResult>('upload avatar', await getDB(), async () => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
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

        //Reset user avatar to default in database #TODO potentially change hardcoded default avatar
        const defaultAvatarUrl = '/uploads/default-avatars/avatarCat1.avif';
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
        .filter((file) => file.startsWith('avatarCat'))
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
    avatarName: string,
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
    limit = 10,
    imageSize = 'med',
    mimeTypes = 'jpeg,jpg,avif,png',
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

      // Get multiple random cats
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?&size=${imageSize}&mime_types=${mimeTypes}&format=json&order=RANDOM&page=0&limit=${limit}`,
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
