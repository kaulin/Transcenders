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
        INSERT INTO user_credentials (user_id, username, email, pw_hash)
        VALUES (${userCreds.user_id}, ${userCreds.username}, ${userCreds.email}, ${userCreds.pw_hash})
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
      'regster user',
      db,
      async (database) => {
        const userCreateResponse = await ApiClient.user.createUser(userCreationInfo);
        if (!userCreateResponse.success) {
          throw new Error(userCreateResponse.error);
        }
        const newUser = userCreateResponse.data as User;

        const userCredentials: UserCredentialsEntry = {
          user_id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          pw_hash: await bcrypt.hash(registration.password, 12),
        };
        await this.insertCredentialsLogic(database, userCredentials);
        return BooleanResultHelper.success(
          `registration successful for ${userCredentials.username}`,
        );
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
        SELECT * FROM user_credentials WHERE username = ${login.username}
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
          { userId: userData.id, username: userData.username },
          // #TODO fix all env stuff
          process.env.JWT_SECRET ?? 'testing',
          { expiresIn: '24h' },
        );
        this.verifyToken(accessToken);
        return { accessToken };
      },
    );
  }

  static verifyToken(token: string): JWTPayload {
    // #TODO fix all env stuff
    return jwt.verify(token, process.env.JWT_SECRET ?? 'testing') as JWTPayload;
  }
}
