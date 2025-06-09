import { ApiClient, User } from '@transcenders/contracts';
import jwt from 'jsonwebtoken';

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

    // Verify hashed pw with bcrypt, might need to has password before function calling also?
    const isValidPassword = true; //await bcrypt.compare(password, user.data.passwordHash);
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
