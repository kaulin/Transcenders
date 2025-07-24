import { Value } from '@sinclair/typebox/value';
import { ERROR_CODES, JWTPayload, JWTPayloadSchema, ServiceError } from '@transcenders/contracts';
import jwt from 'jsonwebtoken';

export class TokenValidator {
  static verifyAccessToken(token: string): JWTPayload {
    return this.verifyToken(token, false);
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return this.verifyToken(token, true);
  }

  private static verifyToken(token: string, isRefreshToken: boolean): JWTPayload {
    const secret = isRefreshToken ? this.getRefreshSecret() : this.getAccessSecret();

    try {
      const payload = jwt.verify(token, secret);

      if (!Value.Check(JWTPayloadSchema, payload)) {
        throw new ServiceError(ERROR_CODES.AUTH.INVALID_TOKEN_STRUCTURE);
      }

      return payload as JWTPayload;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      // Handle JWT library errors
      if (error instanceof jwt.TokenExpiredError) {
        throw new ServiceError(
          ERROR_CODES.AUTH.TOKEN_EXPIRED,
          { expiredAt: error.expiredAt },
          error,
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ServiceError(ERROR_CODES.AUTH.INVALID_TOKEN_STRUCTURE, {}, error);
      }

      // rest of the errors with some context
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_TOKEN_STRUCTURE, { error: String(error) });
    }
  }

  static getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET ?? 'access';
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is required');
    }
    return secret;
  }

  static getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET ?? 'refresh';
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return secret;
  }
}
