import { ApiClient } from '@transcenders/api-client';
import {
  AuthConfig,
  AuthData,
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  decodeToken,
  DeviceInfo,
  ERROR_CODES,
  googleUserInfoSchema,
  JWTPayload,
  LoginUser,
  RefreshToken,
  RefreshTokenInsert,
  RegisterUser,
  ResultHelper,
  ServiceError,
  ServiceResult,
  User,
  UserCredentialsEntry,
} from '@transcenders/contracts';
import {
  DatabaseManager,
  DeviceUtils,
  ENV,
  QueryBuilder,
  TokenValidator,
} from '@transcenders/server-utils';
import * as bcrypt from 'bcrypt';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';

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

  private static async findExistingTokensForDevice(
    database: Database,
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<RefreshToken[]> {
    const sql = SQL`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ${userId}
      AND revoked_at IS NULL
      AND device_fingerprint = ${deviceInfo.deviceFingerprint}
    `;

    const results = await database.all(sql.text, sql.values);
    return results as RefreshToken[];
  }

  private static async revokeRefreshTokens(
    database: Database,
    criteria: { jti?: string; userId?: number },
    reason: string,
  ): Promise<number> {
    let whereClause = `revoked_at IS NULL`;
    const whereValues: unknown[] = [];

    if (criteria.jti) {
      whereClause += ' AND jti = ?';
      whereValues.push(criteria.jti);
    } else if (criteria.userId) {
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

  private static async revokeMultipleTokens(
    database: Database,
    jtis: string[],
    reason: string,
  ): Promise<number> {
    if (jtis.length === 0) return 0;

    const placeholders = jtis.map(() => '?').join(',');
    const whereClause = `revoked_at IS NULL AND jti IN (${placeholders})`;

    const revokeQuery = QueryBuilder.update(
      `refresh_tokens`,
      {
        revoked_at: new Date().toISOString(),
        revoke_reason: reason,
      },
      whereClause,
      jtis,
    );
    const result = await database.run(revokeQuery.sql, revokeQuery.values);
    return result.changes ?? 0;
  }

  // #TODO maybe a seperate try catch to delete user if something actually goes wrong, then rethrow to close up the transaction
  static async register(registration: RegisterUser): Promise<ServiceResult<User>> {
    const userCreationInfo: CreateUserRequest = {
      username: registration.username,
    };
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeTransaction<User>('register user', db, async (database) => {
      const newUser = await ApiClient.user.createUser(userCreationInfo);
      const userCredentials: UserCredentialsEntry = {
        user_id: newUser.id,
        pw_hash: await bcrypt.hash(registration.password, 12),
      };
      await this.insertCredentialsLogic(database, userCredentials);
      return newUser;
    });
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
    const entry: RefreshTokenInsert = {
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

  private static async handleDeviceTokens(
    database: Database,
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<void> {
    // Check if this device already has active tokens
    const existingTokens = await this.findExistingTokensForDevice(database, userId, deviceInfo);
    if (existingTokens.length > 0) {
      // Same device logging in again - revoke ALL existing tokens for this device
      const jtisToRevoke = existingTokens.map((token) => token.jti);
      const revokedCount = await this.revokeMultipleTokens(
        database,
        jtisToRevoke,
        'same_device_relogin',
      );
      console.log(`Revoked ${revokedCount} existing tokens for device during login`);
    }
  }

  static async login(login: LoginUser, deviceInfo: DeviceInfo): Promise<ServiceResult<AuthData>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeTransaction<AuthData>(
      'authenticate user',
      db,
      async (database) => {
        const userData = await ApiClient.user.getUserExact({ username: login.username });

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

        this.handleDeviceTokens(database, userData.id, deviceInfo);
        // generate and save new tokens
        const tokens = this.generateTokenPair(userData.id);
        await this.storeRefreshToken(database, tokens.refreshToken, deviceInfo);

        return tokens;
      },
    );
  }

  private static getGoogleOAuthClient() {
    const { OAuth2 } = google.auth;
    return new OAuth2({
      client_id: ENV.OAUTH_CLIENT_ID,
      client_secret: ENV.OAUTH_CLIENT_SECRET,
      redirectUri: ENV.GOOGLE_REDIRECT_URI,
    });
  }

  static getGoogleAuthUrl() {
    const oauth2Client = this.getGoogleOAuthClient();
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scopes,
    });
    return url;
  }
  // #TODO handle failed user creations, by syncing user and auth DB entries
  static async handleGoogleCallback(
    code: string,
    deviceInfo: DeviceInfo,
  ): Promise<ServiceResult<AuthData>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeTransaction<AuthData>(
      'google auth callback',
      db,
      async (database) => {
        const authClient = this.getGoogleOAuthClient();
        const { tokens } = await authClient.getToken(code);
        if (!tokens?.id_token) {
          throw new Error('failed to google authenticate user');
        }
        const googleUser = decodeToken(tokens.id_token, googleUserInfoSchema);
        let userData: User;
        try {
          userData = await ApiClient.user.getUserExact({ email: googleUser.email });
        } catch {
          const creationData: CreateUserRequest = {
            username: crypto.randomUUID(),
            email: googleUser.email,
            display_name: googleUser.given_name,
          };
          userData = await ApiClient.user.createUser(creationData);
          this.insertCredentialsLogic(database, { user_id: userData.id, pw_hash: '' });
        }

        this.handleDeviceTokens(database, userData.id, deviceInfo);
        // generate and save new tokens
        const newTokens = this.generateTokenPair(userData.id);
        await this.storeRefreshToken(database, newTokens.refreshToken, deviceInfo);
        return newTokens;
      },
    );
  }

  static async logout(
    userId: number,
    refreshToken: string,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeQuery<BooleanOperationResult>(
      'logout user',
      db,
      async (database) => {
        const { jti } = TokenValidator.verifyRefreshToken(refreshToken, userId);
        const sql = SQL`
          SELECT * FROM refresh_tokens WHERE jti = ${jti}
      `;
        const refreshTokenData = await database.get(sql.text, sql.values);
        await TokenValidator.authenticateRefreshToken(refreshToken, refreshTokenData);

        this.revokeRefreshTokens(database, { jti }, 'user logged out');
        return BooleanResultHelper.success('user logged out successfully');
      },
    );
  }

  static async refreshToken(
    refreshToken: string,
    currentDeviceInfo: DeviceInfo,
  ): Promise<ServiceResult<AuthData>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeQuery<AuthData>(
      'refresh access token',
      db,
      async (database) => {
        const { userId, jti } = TokenValidator.verifyRefreshToken(refreshToken);
        const sql = SQL`
          SELECT * FROM refresh_tokens WHERE jti = ${jti}
      `;
        const refreshTokenData = await database.get(sql.text, sql.values);
        // Authenticate token against databaseData
        const storedToken = await TokenValidator.authenticateRefreshToken(
          refreshToken,
          refreshTokenData,
        );

        const storedDeviceInfo = DeviceUtils.fromDatabaseValues(storedToken);
        if (!DeviceUtils.isSameDevice(storedDeviceInfo, currentDeviceInfo)) {
          // SECURITY EVENT: Token used from different device - revoke ALL user tokens
          await this.revokeRefreshTokens(database, { userId }, 'security_device_change');
          throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
            jti,
            userId,
            reason: 'Token used from different device - all sessions revoked for security',
          });
        }
        // generate and store new tokens
        const newTokens = this.generateTokenPair(userId);
        await this.storeRefreshToken(database, newTokens.refreshToken, storedDeviceInfo);
        // revoke old token
        this.revokeRefreshTokens(database, { jti }, 'token_rotation');
        return newTokens;
      },
    );
  }

  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('AUTH').open();
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
    const db = await DatabaseManager.for('AUTH').open();
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
