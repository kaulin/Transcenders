import { ApiClient, DatabaseHelper, DB_ERROR_CODES, User, RegisterUser, CreateUserRequest, BooleanOperationResult, DatabaseResult, UserCredentialsEntry, BooleanResultHelper, UserCredentials, AuthData } from '@transcenders/contracts';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { getAuthDB } from '../db/database';

export interface JWTPayload {
  userId: number;
  username: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private static async insertCredentialsLogic(database: Database, userCreds: UserCredentialsEntry): Promise<Boolean>{
    const sql = SQL`
        INSERT INTO user_credentials (user_id, username, email, pw_hash)
        VALUES (${userCreds.user_id}, ${userCreds.username}, ${userCreds.email}, ${userCreds.pw_hash})
      `;
        const result = await database.run(sql.text, sql.values);
        if (!result.lastID) {
          throw new Error('Failed to add user credentials');
        }
        return true;
  };

  static async register(registration: RegisterUser): Promise<DatabaseResult<BooleanOperationResult>> {
    const userCreationInfo: CreateUserRequest = {
         username: registration.username,
         email: registration.email
    }
    const db = await getAuthDB();
    return DatabaseHelper.executeTransaction<BooleanOperationResult>('regster user', db, async (database) => {
      const userCreateResponse = await ApiClient.createUser(userCreationInfo);
      if (!userCreateResponse.success) {
        throw new Error(`auth-service: register: failed to create user`);
      }
      const newUser = userCreateResponse.data as User;

      const userCredentials: UserCredentialsEntry = {
        user_id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        pw_hash: await bcrypt.hash(registration.password, 12)
      }
      await this.insertCredentialsLogic(database, userCredentials);
      return BooleanResultHelper.success(`registration successful for ${userCredentials.username}`);

    });
  };
  static async login(username: string, password: string): Promise<AuthData> {
    // Get user from user-service with schema validation
    const apiResponse = await ApiClient.getUserExact({ username: username });
    if (!apiResponse.success) {
      throw new Error(`Authentication failed: ${apiResponse.error}`);
    }
    const userData = apiResponse.data as User;

    const db: Database = await getAuthDB();
    const auth_data = await DatabaseHelper.executeQuery<UserCredentials>(
      'auth: get user by username',
      db,
      async (database) => {
        const sql = SQL`
        SELECT * FROM user_credentials WHERE username = ${username}
      `;
        const userCredentials = await database.get(sql.text, sql.values);
        if (!userCredentials) {
          throw new Error(`user '${username}' not found`);
        }
        return userCredentials as UserCredentials;
      },
    );
    let result: AuthData = {
      success: false,
      accessToken:'',
    };

    if (auth_data.success) {
      const userCreds = auth_data.data as UserCredentials;
      const isValidPassword = bcrypt.compare(password, userCreds.pw_hash);


    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate JWT accessToken
    result.accessToken = jwt.sign(
      { userId: userData.id, username: userData.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' },
    );
    result.success = true;
  }
  return result;
}

  static verifyToken(token: string): JWTPayload {

  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
}
