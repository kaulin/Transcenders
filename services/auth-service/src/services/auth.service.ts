import { ApiClient, DatabaseHelper, DB_ERROR_CODES, User } from '@transcenders/contracts';
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
  static async login(username: string, password: string) {
    // Get user from user-service with schema validation
    const apiResponse = await ApiClient.getUserExact({ username: username });
    if (!apiResponse.success) {
      throw new Error(`Authentication failed: ${apiResponse.error}`);
    }
    const userData = apiResponse.data as User;

    const salt = await bcrypt.genSalt(10);
    const pw_hash = await bcrypt.hash(password, salt);

    const db: Database = await getAuthDB();
    const insert = await DatabaseHelper.executeQuery<boolean>(
      'creating user_credentials entry for fun',
      db,
      async (database) => {
        const sql = SQL`
        INSERT INTO user_credentials (user_id, username, email, pw_hash)
        VALUES (${userData.id}, ${username}, ${userData.email}, ${pw_hash})
      `;
        const result = await database.run(sql.text, sql.values);
        if (!result.lastID) {
          throw new Error('Failed to create user');
        }
        return true;
      },
    );

    const auth_data = await DatabaseHelper.executeQuery<any>(
      'auth: get user by username',
      db,
      async (database) => {
        const sql = SQL`
        SELECT * FROM user_credentials WHERE username = ${username}
      `;
        const user = await database.get(sql.text, sql.values);
        if (!user) {
          const error = new Error(`user '${username}' not found`);
          (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
          throw error;
        }
        return user;
      },
    );

    const wrongpw = '$2b$10$edmS4rwIv5tew1Qq0yg1GOevP2kDsSqI02v.INKteFOpcFsadahTZre4a';
    // Verify hashed pw with bcrypt, might need to has password before function calling also?
    const isValidPassword = await bcrypt.compare(password, auth_data.data.pw_hash);
    // const isValidPassword = await bcrypt.compare(password, wrongpw);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate JWT accessToken
    const accessToken = jwt.sign(
      { userId: userData.id, username: userData.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' },
    );

    return {
      accessToken,
      user: userData,
    };
  }

  static verifyToken(token: string): JWTPayload {
    // on verfy it creates an object of what you put in with jwt.sign() + exp (expires at) and iat (initiated at or w/e)
    /**
     {
      userId: 1,
      username: "alice",
      iat: 1749424758,
      exp: 1749425658,
      }
     */
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
}
