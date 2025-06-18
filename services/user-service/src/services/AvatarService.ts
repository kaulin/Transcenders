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
import { pipeline } from 'stream';
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

        const uploadDir = this.getUploadDir();
        // Remove old avatar if exists
        await this.removeOldAvatar(uploadDir, userId);

        // filename: userId + extension
        const ext = path.extname(file.filename) ?? '.42';
        const filename = `${userId}${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Save the file
        await pump(file.file, fs.createWriteStream(filePath));

        const avatarPath = `/uploads/avatars/${filename}`;

        const sql = SQL`
        UPDATE users SET avatar = ${avatarPath}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}
        `;
        await database.run(sql.text, sql.values);
        return BooleanResultHelper.success(`user '${userId}' avatar changed`);
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

        const sql = SQL`
          UPDATE users SET avatar = ${avatarUrl}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}
        `;
        await database.run(sql.text, sql.values);

        const result: SetAvatarResult = {
          success: true,
          url: avatarUrl,
        };

        return result;
      },
    );
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
