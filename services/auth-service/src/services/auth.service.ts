import { Value } from '@sinclair/typebox/value';
import { ApiClient } from '@transcenders/api-client';
import {
  AuthConfig,
  AuthData,
  authDataAccessOnly,
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  decodeToken,
  DeviceInfo,
  ERROR_CODES,
  GoogleFlows,
  GoogleUserInfo,
  googleUserInfoSchema,
  JWTPayload,
  LoginUser,
  RefreshToken,
  RefreshTokenInsert,
  RegisterUser,
  ResultHelper,
  ServiceError,
  ServiceResult,
  StepupMethod,
  StepupRequest,
  twoFactorEntrySchema,
  User,
  UserCredentials,
  UserCredentialsEntry,
  UserCredentialsInfo,
  userCredentialsSchema,
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
import { TwoFactorService } from './twoFactor.service.js';
import { TwoFactorChallengeService } from './twoFactorChallenge.service.js';

export class AuthService {
  private static async insertCredentialsLogic(
    database: Database,
    userCreds: UserCredentialsEntry,
  ): Promise<boolean> {
    const { sql, values } = QueryBuilder.insert('user_credentials', userCreds);
    const result = await database.run(sql, values);
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
        google_linked: false,
        two_fac_enabled: false,
      };
      await this.insertCredentialsLogic(database, userCredentials);
      return newUser;
    });
  }

  private static generateTokenPair(userId: number, stepupMethod?: StepupMethod): AuthData {
    const basePayload: JWTPayload = {
      userId,
      aud: 'transcenders',
      iss: 'auth-service',
      jti: crypto.randomUUID(),
    };

    const accessPayload: JWTPayload = stepupMethod
      ? { ...basePayload, stepup: true, stepup_method: stepupMethod }
      : basePayload;

    const accessToken = jwt.sign(accessPayload, TokenValidator.getAccessSecret(), {
      expiresIn: Math.floor(AuthConfig.ACCESS_TOKEN_EXPIRE_MS / 1000),
    });

    const refreshToken = jwt.sign(basePayload, TokenValidator.getRefreshSecret(), {
      expiresIn: Math.floor(AuthConfig.REFRESH_TOKEN_EXPIRE_MS / 1000),
    });

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

  private static async emailExists(
    database: Database,
    email: string,
  ): Promise<UserCredentials | undefined> {
    const sql = SQL`
      SELECT * FROM 'two_factor' WHERE email = ${email} LIMIT 1
    `;
    const result = await database.get(sql.text, sql.values);
    return result as UserCredentials | undefined;
  }

  private static async userIdByEmail(database: Database, email: string): Promise<number> {
    const sql = SQL`
      SELECT * FROM 'two_factor' WHERE email = ${email}
    `;
    const result = await database.get(sql.text, sql.values);
    Value.Assert(twoFactorEntrySchema, result);
    return result.user_id;
  }

  private static async userCredsByUserId(
    database: Database,
    userId: number,
  ): Promise<UserCredentialsEntry> {
    const sql = SQL`
        SELECT * FROM user_credentials WHERE user_id = ${userId}
      `;
    const userCredentials = await database.get(sql.text, sql.values);
    if (!Value.Check(userCredentialsSchema, userCredentials)) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        username: userId,
      });
    }
    return userCredentials;
  }

  private static async assertPassword(password: string, pw_hash: string | null): Promise<boolean> {
    if (pw_hash === null)
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        reason: 'user password null',
      });
    const isValidPassword = await bcrypt.compare(password, pw_hash);
    if (!isValidPassword) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS);
    }
    return true;
  }

  static async finalizeLogin(
    database: Database,
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<AuthData> {
    await this.handleDeviceTokens(database, userId, deviceInfo);
    const tokens = this.generateTokenPair(userId);
    await this.storeRefreshToken(database, tokens.refreshToken, deviceInfo);
    return tokens;
  }

  static async preLoginRead(login: LoginUser) {
    const db = await DatabaseManager.for('AUTH').open();
    const result = await ResultHelper.executeQuery('prelogin read + gate', db, async (database) => {
      const user = await ApiClient.user.getUserExact({ username: login.username });
      const creds = await this.userCredsByUserId(database, user.id);
      await this.assertPassword(login.password, creds.pw_hash);
      const twoFacEnabled = creds.two_fac_enabled;

      return { userId: user.id, twoFacEnabled };
    });
    if (result.success) return result.data;
    else throw result.error;
  }

  static async login(login: LoginUser, deviceInfo: DeviceInfo): Promise<ServiceResult<AuthData>> {
    const db = await DatabaseManager.for('AUTH').open();
    const { userId, twoFacEnabled } = await this.preLoginRead(login);
    if (login.code && twoFacEnabled) {
      await ApiClient.auth.twoFacLogin(userId, login.code);
    }

    if (!login.code && twoFacEnabled) {
      const { expiresAt } = await ApiClient.auth.twoFacRequestLogin(userId);
      return ResultHelper.error(ERROR_CODES.AUTH.TWO_FACTOR_CODE_SENT, '2FA required', {
        userId,
        expiresAt,
      });
    }
    return await ResultHelper.executeTransaction<AuthData>(
      'finalize login',
      db,
      async (database) => {
        return this.finalizeLogin(database, userId, deviceInfo);
      },
    );
  }

  static async stepup(
    userId: number,
    stepup: StepupRequest,
  ): Promise<ServiceResult<authDataAccessOnly>> {
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeQuery<authDataAccessOnly>('stepup request', db, async (database) => {
      const userCreds = await this.userCredsByUserId(database, userId);
      switch (stepup.method) {
        case '2fa':
          await TwoFactorChallengeService.assertVerify(database, userId, 'stepup', stepup.code);
          break;
        case 'google':
          const googleUser = await this.getGoogleUser(stepup.googleCode);
          await this.validateGoogleUserOwnership(database, googleUser, userId);
          break;
        case 'password':
          await this.assertPassword(stepup.password, userCreds.pw_hash);
          break;
        default:
          throw new ServiceError(ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, {
            reason: 'invalid stepup case',
          });
      }
      const tokens = this.generateTokenPair(userId, stepup.method);
      const accessToken: authDataAccessOnly = { accessToken: tokens.accessToken };
      // only sending access elevated access token
      return accessToken;
    });
  }

  private static getGoogleOAuthClient() {
    const { OAuth2 } = google.auth;
    return new OAuth2({
      client_id: ENV.OAUTH_CLIENT_ID,
      client_secret: ENV.OAUTH_CLIENT_SECRET,
      redirectUri: ENV.GOOGLE_REDIRECT_URI,
    });
  }

  static getGoogleAuthUrl(flow: GoogleFlows) {
    return ResultHelper.executeOperation('get google auth url', async () => {
      const oauth2Client = this.getGoogleOAuthClient();
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'online',
        scope: scopes,
        state: flow,
      });
      return url;
    });
  }

  private static async generateUsername(googleUser: GoogleUserInfo): Promise<string> {
    const firstName = googleUser.given_name.replace(/\s+/g, '') || 'user';
    const fullName = googleUser.name.trim() || 'user';
    const email = googleUser.email.toLowerCase();
    const emailPrefix = email.split('@')[0];

    const patterns = [
      firstName,
      firstName.toLowerCase(),
      firstName ? `${firstName.at(0)}${fullName.split(' ').pop()}` : null,
      firstName ? `${firstName}${fullName.split(' ').pop()?.at(0)}` : null,
      fullName.replace(/\s+/g, ''),
      fullName.replace(/\s+/g, '').toLowerCase(),
      emailPrefix,
      `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
      `${emailPrefix}${Math.floor(Math.random() * 100)}`,
      `user${Math.floor(Math.random() * 10000)}`,
      `${firstName}${crypto.randomUUID().slice(0, 8)}`,
    ].filter((pattern): pattern is string => typeof pattern === 'string' && pattern.length >= 3);

    for (const username of patterns) {
      try {
        await ApiClient.user.getUserExact({ username });
      } catch (error) {
        return username;
      }
    }

    // Fallback on some crazy bad luck
    return `user_${Date.now()}`;
  }

  private static async getGoogleUser(code: string): Promise<GoogleUserInfo> {
    const authClient = this.getGoogleOAuthClient();
    const { tokens } = await authClient.getToken(code);
    if (!tokens?.id_token) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        reason: 'Invalid or expired OAuth code',
      });
    }
    return decodeToken(tokens.id_token, googleUserInfoSchema);
  }

  private static async validateGoogleUserOwnership(
    database: Database,
    googleUser: GoogleUserInfo,
    expectedUserId: number,
  ): Promise<void> {
    const userExists = await this.emailExists(database, googleUser.email);
    if (!userExists) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        reason: 'Google account not linked to this user',
        userId: expectedUserId,
      });
    }

    const linkedUserId = await this.userIdByEmail(database, googleUser.email);
    if (linkedUserId !== expectedUserId) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        reason: 'Google account linked to different user',
        userId: expectedUserId,
        linkedUserId,
      });
    }
  }
  static async setGoogleLinkedStatus(database: Database, userId: number, value = true) {
    const updateSql = SQL`
      UPDATE user_credentials 
      SET google_linked = ${value} 
      WHERE user_id = ${userId}
    `;
    await database.run(updateSql.text, updateSql.values);
  }

  static async setTwoFacStatus(database: Database, userId: number, value = true) {
    const updateSql = SQL`
      UPDATE user_credentials 
      SET two_fac_enabled = ${value} 
      WHERE user_id = ${userId}
    `;
    await database.run(updateSql.text, updateSql.values);
  }

  static async googleConnect(userId: number, code: string) {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeTransaction<BooleanOperationResult>(
      'connect a google email',
      db,
      async (database) => {
        const googleUser = await this.getGoogleUser(code);
        const existingUser = await this.emailExists(database, googleUser.email);
        if (existingUser && existingUser.id === userId) {
          await this.setGoogleLinkedStatus(database, userId);
        } else if (!existingUser) {
          await TwoFactorService.initiateDatabaseEntry(database, userId, googleUser.email, true);
          await this.setGoogleLinkedStatus(database, userId);
          await this.setTwoFacStatus(database, userId);
        } else {
          throw new ServiceError(ERROR_CODES.AUTH.GOOGLE_AUTH_FAILED, {
            reason: 'email is already linked to a different user',
          });
        }

        return BooleanResultHelper.success('google email connected');
      },
    );
  }

  // #TODO handle failed user creations, by syncing user and auth DB entries
  static async googleLogin(code: string, deviceInfo: DeviceInfo): Promise<ServiceResult<AuthData>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeTransaction<AuthData>(
      'login or create google user',
      db,
      async (database) => {
        const googleUser = await this.getGoogleUser(code);
        let userId: number;

        const userExists = await this.emailExists(database, googleUser.email);
        if (!userExists) {
          const creationData: CreateUserRequest = {
            username: await this.generateUsername(googleUser),
            display_name: googleUser.given_name,
          };
          const newUser = await ApiClient.user.createUser(creationData);
          userId = newUser.id;
          const CredentialsData: UserCredentialsEntry = {
            user_id: userId,
            pw_hash: null,
            google_linked: true,
            two_fac_enabled: true,
          };
          await this.insertCredentialsLogic(database, CredentialsData);
          await TwoFactorService.initiateDatabaseEntry(database, userId, googleUser.email, true);
        } else {
          if (!userExists.google_linked) {
            await this.setGoogleLinkedStatus(database, userExists.user_id);
          }
          userId = await this.userIdByEmail(database, googleUser.email);
        }

        this.handleDeviceTokens(database, userId, deviceInfo);
        // generate and save new tokens
        const newTokens = this.generateTokenPair(userId);
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
    newPassword: string,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeQuery<BooleanOperationResult>(
      'change password',
      db,
      async (database) => {
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

  static async getUserCredsInfo(userId: number): Promise<ServiceResult<UserCredentialsInfo>> {
    const db = await DatabaseManager.for('AUTH').open();
    return await ResultHelper.executeQuery<UserCredentialsInfo>(
      'Update creds',
      db,
      async (database) => {
        const userCreds = await this.userCredsByUserId(database, userId);
        const userCredsData: UserCredentialsInfo = {
          userId,
          googleLinked: !!userCreds.google_linked,
          hasPassword: !!userCreds.pw_hash,
          twoFacEnabled: !!userCreds.two_fac_enabled,
        };
        return userCredsData;
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
