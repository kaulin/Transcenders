import { MultipartFile } from '@fastify/multipart';
import {
  BooleanOperationResult,
  BooleanResultHelper,
  DatabaseHelper,
  DatabaseResult,
  DefaultAvatarsResult,
  SetAvatarResult,
} from '@transcenders/contracts';
import fs from 'fs';
import path from 'path';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { getDB } from '../db/database';

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

    // Copy default avatars from frontend to backend (run once)
    await this.copyDefaultAvatars(defaultAvatarsDir);
  }

  static async uploadAvatar(
    userId: string,
    file: MultipartFile,
  ): Promise<DatabaseResult<BooleanOperationResult>> {
    return DatabaseHelper.executeQuery<BooleanOperationResult>(
      'upload avatar',
      await getDB(),
      async (database) => {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          throw new Error('Invalid file type. Only images are allowed.');
        }

        // Save file and get the avatar path
        const ext = path.extname(file.filename);
        const avatarPath = await this.saveFileToUploads(userId, ext, file.file);

        // Update database
        await this.updateUserAvatar(database, userId, avatarPath);

        return BooleanResultHelper.success(`user '${userId}' avatar changed`);
      },
    );
  }

  static async setRandomAvatar(userId: string): Promise<DatabaseResult<SetAvatarResult>> {
    return DatabaseHelper.executeQuery<SetAvatarResult>(
      'set random avatar',
      await getDB(),
      async (database) => {
        const headers = new Headers({
          'Content-Type': 'application/json',
          'x-api-key': `${process.env.CAT_API_KEY}`,
        });

        const requestOptions: RequestInit = {
          method: 'GET',
          headers: headers,
          redirect: 'follow',
        };

        // get a random cat object
        const response = await fetch(
          'https://api.thecatapi.com/v1/images/search?&mime_types=jpg,png,avif&size=any&format=json&order=RANDOM&page=0&limit=1',
          requestOptions,
        );

        if (!response.ok) {
          throw new Error(`Cat API error: ${response.status}`);
        }

        // Parse the JSON
        const catData = await response.json();

        if (!catData || catData.length === 0) {
          throw new Error('No cat image found');
        }

        const imageUrl = catData[0].url;

        // Download the actual image
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }

        // save image
        const extension = path.extname(imageUrl);
        const body = imageResponse.body;
        if (!body) {
          throw new Error('No response body');
        }
        const nodeStream = Readable.fromWeb(body as any);
        const avatarPath = await this.saveFileToUploads(userId, extension, nodeStream);

        // Update database
        await this.updateUserAvatar(database, userId, avatarPath);

        const result: SetAvatarResult = {
          success: true,
          url: avatarPath,
        };

        return result;
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
  ): Promise<DatabaseResult<SetAvatarResult>> {
    const defaultAvatarsDir = this.getDefaultAvatarsDir();
    return DatabaseHelper.executeQuery<SetAvatarResult>(
      'set default avatar',
      await getDB(),
      async (database) => {
        // Validate avatar exists
        const avatarPath = path.join(defaultAvatarsDir, avatarName);
        if (!fs.existsSync(avatarPath)) {
          throw new Error('Avatar not found');
        }

        // Update user's avatar in database
        const avatarUrl = `/uploads/default-avatars/${avatarName}`;

        await this.updateUserAvatar(database, userId, avatarUrl);

        const result: SetAvatarResult = {
          success: true,
          url: avatarUrl,
        };

        return result;
      },
    );
  }

  private static async saveFileToUploads(
    userId: string,
    extension: string,
    fileStream: NodeJS.ReadableStream,
  ): Promise<string> {
    const uploadDir = this.getUploadDir();

    // Remove old avatar if exists
    await this.removeOldAvatar(uploadDir, userId);

    // Create new filename and path
    const filename = `${userId}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Save the file
    await pump(fileStream, fs.createWriteStream(filePath));

    // Return the avatar path for database
    return `/uploads/avatars/${filename}`;
  }

  private static async updateUserAvatar(
    database: Database,
    userId: string,
    avatarPath: string,
  ): Promise<void> {
    const sql = SQL`
      UPDATE users SET avatar = ${avatarPath}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}
    `;
    await database.run(sql.text, sql.values);
  }

  private static async copyDefaultAvatars(defaultAvatarsDir: string): Promise<void> {
    const frontendAvatarsDir = path.join(import.meta.dirname, '../../../../web/public/images');

    try {
      const files = fs.readdirSync(frontendAvatarsDir);
      const avatarFiles = files.filter((file) => file.startsWith('avatarCat'));

      for (const file of avatarFiles) {
        const src = path.join(frontendAvatarsDir, file);
        const dest = path.join(defaultAvatarsDir, file);

        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
          console.log(`Copied default avatar: ${file}`);
        }
      }
    } catch (error) {
      console.log('Note: Could not copy default avatars from frontend');
    }
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
}
