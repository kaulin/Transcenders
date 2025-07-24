import { ApiClient } from '@transcenders/api-client';
import {
  AuthConfig,
  AuthData,
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  DeviceInfo,
  ERROR_CODES,
  ErrorCode,
  JWTPayload,
  LoginUser,
  RefreshTokenEntry,
  RegisterUser,
  ResultHelper,
  ServiceError,
  ServiceResult,
  User,
  UserCredentialsEntry,
} from '@transcenders/contracts';
import { DeviceUtils, QueryBuilder, TokenValidator } from '@transcenders/server-utils';
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

  private static async findExistingTokenForDevice(
    database: Database,
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<RefreshTokenEntry | null> {
    const sql = SQL`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ${userId}
      AND revoked_at IS NULL
      AND device_fingerprint = ${deviceInfo.deviceFingerprint}
      AND ip_address = ${deviceInfo.ipAddress}
    `;

    const result = await database.get(sql.text, sql.values);
    return result as RefreshTokenEntry | null;
  }

  private static async revokeRefreshTokens(
    database: Database,
    criteria: { jti?: string; userId?: number; all?: boolean },
    reason: string,
  ): Promise<number> {
    let whereClause = `revoked_at IS NULL`;
    const whereValues: unknown[] = [];

    if (criteria.jti) {
      whereClause += ' AND jti = ?';
      whereValues.push(criteria.jti);
    } else if (criteria.userId && !criteria.all) {
      // Revoke only current session tokens for user
      whereClause += ' AND user_id = ? LIMIT 1';
      whereValues.push(criteria.userId);
    } else if (criteria.userId && criteria.all) {
      // Revoke ALL tokens for user (security event)
      whereClause += ' AND user_id = ?';
      whereValues.push(criteria.userId);
    }

    const revokeQuery = QueryBuilder.update(
      `refresh_tokens`,
      {
        revoked_at: new Date().toISOString(),
        revoke_reason: reason,
      },
      whereClause,
      whereValues,
    );
    const result = await database.run(revokeQuery.sql, revokeQuery.values);
    return result.changes ?? 0;
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
            userCreateResponse.error.codeOrError as ErrorCode,
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

  private static generateTokenPair(userId: number): AuthData {
    const payload: JWTPayload = {
      userId: userId,
      aud: 'transcenders',
      iss: 'auth-service',
      jti: crypto.randomUUID(),
    };
    const accessToken = jwt.sign(payload, TokenValidator.getAccessSecret());
    const refreshToken = jwt.sign(payload, TokenValidator.getRefreshSecret());

    return { accessToken, refreshToken, expiresIn: AuthConfig.ACCESS_TOKEN_EXPIRE_MS };
  }

  private static async storeRefreshToken(
    database: Database,
    refreshToken: string,
    deviceInfo: DeviceInfo,
  ): Promise<void> {
    const { userId, jti } = jwt.decode(refreshToken) as JWTPayload;
    const entry: RefreshTokenEntry = {
      user_id: userId,
      token_hash: await bcrypt.hash(refreshToken, 12),
      expires_at: new Date(Date.now() + AuthConfig.REFRESH_TOKEN_EXPIRE_MS).toISOString(),
      jti,
      device_fingerprint: deviceInfo.deviceFingerprint,
      ip_address: deviceInfo.ipAddress,
      user_agent: deviceInfo.userAgent,
    };
    const { sql, values } = QueryBuilder.insert('refresh_tokens', entry);
    await database.run(sql, values);
  }

  static async login(login: LoginUser, deviceInfo: DeviceInfo): Promise<ServiceResult<AuthData>> {
    const db: Database = await getAuthDB();
    return await ResultHelper.executeTransaction<AuthData>(
      'authenticate user',
      db,
      async (database) => {
        const apiResponse = await ApiClient.user.getUserExact({ username: login.username });
        if (!apiResponse.success) {
          throw new ServiceError(
            apiResponse.error.codeOrError as ErrorCode,
            apiResponse.error.context,
          );
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

        // Check if this device already has active tokens
        const existingToken = await this.findExistingTokenForDevice(
          database,
          userData.id,
          deviceInfo,
        );
        if (existingToken) {
          // Same device logging in again - revoke existing tokens for this device
          await this.revokeRefreshTokens(
            database,
            { jti: existingToken.jti },
            'same_device_relogin',
          );
        }

        const tokens = this.generateTokenPair(userData.id);
        // store refresh token in the database
        await this.storeRefreshToken(database, tokens.refreshToken, deviceInfo);

        return tokens;
      },
    );
  }

  static async refreshToken(
    refreshToken: string,
    currentDeviceInfo: DeviceInfo,
  ): Promise<ServiceResult<AuthData>> {
    const db = await getAuthDB();
    return await ResultHelper.executeQuery<AuthData>(
      'refresh access token',
      db,
      async (database) => {
        const { userId, jti } = TokenValidator.verifyRefreshToken(refreshToken);
        const sql = SQL`
        SELECT * FROM refresh_tokens WHERE jti = ${jti}
        AND user_id = ${userId}
        AND revoked_at IS NULL
      `;
        const storedToken = await database.get(sql.text, sql.values);
        if (!storedToken) {
          throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
            jti,
            userId,
            reason: 'Refresh token not found, revoked, or expired',
          });
        }

        const isValidToken = await bcrypt.compare(refreshToken, storedToken.token_hash);
        if (!isValidToken) {
          throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
            jti,
            userId,
            reason: 'Refresh token hash mismatch',
          });
        }

        const storedDeviceInfo = DeviceUtils.fromDatabaseValues(storedToken);
        if (!DeviceUtils.isSameDevice(storedDeviceInfo, currentDeviceInfo)) {
          // SECURITY EVENT: Token used from different device - revoke ALL user tokens
          await this.revokeRefreshTokens(database, { userId, all: true }, 'security_device_change');
          throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
            jti,
            userId,
            reason: 'Token used from different device - all sessions revoked for security',
          });
        }
        this.revokeRefreshTokens(database, { jti }, 'token_rotation');

        const newTokens = this.generateTokenPair(userId);
        await this.storeRefreshToken(database, newTokens.refreshToken, storedDeviceInfo);
        return newTokens;
      },
    );
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
}
