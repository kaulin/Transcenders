import { ApiClient } from '@transcenders/api-client';
import {
  AuthData,
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  ERROR_CODES,
  ErrorCode,
  JWTPayload,
  LoginUser,
  RegisterUser,
  ResultHelper,
  ServiceError,
  ServiceResult,
  User,
  UserCredentialsEntry,
} from '@transcenders/contracts';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { getAuthDB } from '../db/database';

export class AuthService {
  private static async insertCredentialsLogic(
    database: Database,
    userCreds: UserCredentialsEntry,
  ): Promise<boolean> {
    const sql = SQL`
        INSERT INTO user_credentials (user_id, pw_hash)
        VALUES (${userCreds.user_id}, ${userCreds.pw_hash})
      `;
    const result = await database.run(sql.text, sql.values);
    if (!result.lastID) {
      throw new ServiceError(ERROR_CODES.AUTH.REGISTRATION_FAILED, {
        reason: 'Failed to add user credentials',
        userId: userCreds.user_id,
      });
    }
    return true;
  }

  static async register(
    registration: RegisterUser,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const userCreationInfo: CreateUserRequest = {
      username: registration.username,
      email: registration.email,
    };
    const db = await getAuthDB();
    return ResultHelper.executeTransaction<BooleanOperationResult>(
      'register user',
      db,
      async (database) => {
        const userCreateResponse = await ApiClient.user.createUser(userCreationInfo);
        if (!userCreateResponse.success) {
          throw new ServiceError(
            userCreateResponse.error.code as ErrorCode,
            userCreateResponse.error.context,
          );
        }
        const newUser = userCreateResponse.data as User;

        const userCredentials: UserCredentialsEntry = {
          user_id: newUser.id,
          pw_hash: await bcrypt.hash(registration.password, 12),
        };
        await this.insertCredentialsLogic(database, userCredentials);
        return BooleanResultHelper.success(`registration successful for ${newUser.username}`);
      },
    );
  }

  static async login(login: LoginUser): Promise<ServiceResult<AuthData>> {
    const db: Database = await getAuthDB();
    return await ResultHelper.executeQuery<AuthData>('authenticate user', db, async (database) => {
      // Get user from user-service with schema validation
      const apiResponse = await ApiClient.user.getUserExact({ username: login.username });
      if (!apiResponse.success) {
        throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_USERNAME, {
          username: login.username,
          originalError: apiResponse.error,
        });
      }
      const userData = apiResponse.data as User;

      // get the matching user credentials entry
      const sql = SQL`
        SELECT * FROM user_credentials WHERE user_id = ${userData.id}
      `;
      const userCredentials = await database.get(sql.text, sql.values);
      if (!userCredentials) {
        throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
          username: login.username,
        });
      }

      const userCreds = userCredentials as UserCredentialsEntry;
      const isValidPassword = await bcrypt.compare(login.password, userCreds.pw_hash);
      if (!isValidPassword) {
        throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
          username: login.username,
        });
      }

      // Generate JWT accessToken
      const accessToken = jwt.sign(
        { userId: userData.id },
        // TODO fix all env stuff
        process.env.JWT_SECRET ?? 'testing',
        { expiresIn: '24h' },
      );
      this.verifyToken(accessToken);
      return { accessToken };
    });
  }

  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await getAuthDB();
    return await ResultHelper.executeQuery<BooleanOperationResult>(
      'change password',
      db,
      async (database) => {
        // Get current credentials
        const sql = SQL`
          SELECT * FROM user_credentials WHERE user_id = ${userId}
        `;
        const userCredentials = await database.get(sql.text, sql.values);
        if (!userCredentials) {
          throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_ID, {
            userId,
          });
        }

        const userCreds = userCredentials as UserCredentialsEntry;

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, userCreds.pw_hash);
        if (!isValidPassword) {
          throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
            userId,
            reason: 'Current password is incorrect',
          });
        }

        // Hash new password and update
        const newHashedPassword = await bcrypt.hash(newPassword, 12);
        const updateSql = SQL`
          UPDATE user_credentials SET pw_hash = ${newHashedPassword} WHERE user_id = ${userId}
        `;

        const result = await database.run(updateSql.text, updateSql.values);
        if ((result.changes ?? 0) === 0) {
          return BooleanResultHelper.failure(`Failed to update password for user ${userId}`);
        }

        return BooleanResultHelper.success(`Password successfully changed for user ${userId}`);
      },
    );
  }

  private static async deleteCredentialsLogic(
    database: Database,
    userId: number,
  ): Promise<boolean> {
    // delete logic
    const sql = SQL`
      DELETE FROM user_credentials WHERE user_id = ${userId}
    `;
    const result = await database.run(sql.text, sql.values);
    const deleted = (result.changes ?? 0) > 0;
    if (deleted) {
      return true;
    }
    return false;
  }

  static async deleteCredentials(userId: number): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await getAuthDB();
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'delete user credentials',
      db,
      async (database) => {
        // Check if user exists
        const checkUserSql = SQL`
        SELECT 1 FROM user_credentials WHERE user_id = ${userId}
        `;
        const userExists = await database.get(checkUserSql.text, checkUserSql.values);
        if (!userExists) {
          throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_ID, {
            userId,
            reason: 'User credentials do not exist',
          });
        }
        const deleted = await this.deleteCredentialsLogic(db, userId);
        if (!deleted) {
          throw new ServiceError(ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, {
            userId,
            reason: 'No changes were made to user credentials',
          });
        }
        return BooleanResultHelper.success(
          `User credentials for user_id ${userId} have been successfully deleted`,
        );
      },
    );
  }
  static verifyToken(token: string): JWTPayload {
    // #TODO fix all env stuff
    return jwt.verify(token, process.env.JWT_SECRET ?? 'testing') as JWTPayload;
  }
}
