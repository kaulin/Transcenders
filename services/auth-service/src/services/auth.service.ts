import { ApiClient } from '@transcenders/api-client';
import {
  AuthData,
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  DatabaseHelper,
  DatabaseResult,
  JWTPayload,
  LoginUser,
  RegisterUser,
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
      throw new Error('Failed to add user credentials');
    }
    return true;
  }

  static async register(
    registration: RegisterUser,
  ): Promise<DatabaseResult<BooleanOperationResult>> {
    const userCreationInfo: CreateUserRequest = {
      username: registration.username,
      email: registration.email,
    };
    const db = await getAuthDB();
    return DatabaseHelper.executeTransaction<BooleanOperationResult>(
      'register user',
      db,
      async (database) => {
        const userCreateResponse = await ApiClient.user.createUser(userCreationInfo);
        if (!userCreateResponse.success) {
          throw new Error(userCreateResponse.error);
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

  static async login(login: LoginUser): Promise<DatabaseResult<AuthData>> {
    const db: Database = await getAuthDB();
    return await DatabaseHelper.executeQuery<AuthData>(
      'auth: get user by username',
      db,
      async (database) => {
        // Get user from user-service with schema validation
        const apiResponse = await ApiClient.user.getUserExact({ username: login.username });
        if (!apiResponse.success) {
          throw new Error(`Authentication failed: ${apiResponse.error}`);
        }
        const userData = apiResponse.data as User;

        // get the matching user credentials entry
        const sql = SQL`
        SELECT * FROM user_credentials WHERE user_id = ${userData.id}
      `;
        const userCredentials = await database.get(sql.text, sql.values);
        if (!userCredentials) {
          throw new Error(`user '${login.username}' not found`);
        }

        const userCreds = userCredentials as UserCredentialsEntry;
        const isValidPassword = await bcrypt.compare(login.password, userCreds.pw_hash);
        if (!isValidPassword) {
          throw new Error('Invalid password');
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
      },
    );
  }

  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<DatabaseResult<BooleanOperationResult>> {
    const db = await getAuthDB();
    return await DatabaseHelper.executeQuery<BooleanOperationResult>(
      'auth: change password',
      db,
      async (database) => {
        // Get current credentials
        const sql = SQL`
          SELECT * FROM user_credentials WHERE user_id = ${userId}
        `;
        const userCredentials = await database.get(sql.text, sql.values);
        if (!userCredentials) {
          throw new Error(`User credentials not found for user ${userId}`);
        }

        const userCreds = userCredentials as UserCredentialsEntry;

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, userCreds.pw_hash);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
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

  static async deleteCredentials(userId: number): Promise<DatabaseResult<BooleanOperationResult>> {
    const db = await getAuthDB();
    return DatabaseHelper.executeQuery<BooleanOperationResult>(
      'auth: delete user credentials',
      db,
      async (database) => {
        // Check if user exists
        const checkUserSql = SQL`
        SELECT 1 FROM user_credentials WHERE user_id = ${userId}
        `;
        const userExists = await database.get(checkUserSql.text, checkUserSql.values);
        if (!userExists) {
          return BooleanResultHelper.failure(
            `user credentials with userid '${userId}' do not exist`,
          );
        }
        const deleted = await this.deleteCredentialsLogic(db, userId);
        if (!deleted) {
          return BooleanResultHelper.failure(`No changes were made to user credentials: ${userId}`);
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
