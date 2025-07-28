import { Value } from '@sinclair/typebox/value';
import {
  ERROR_CODES,
  JWTPayload,
  JWTPayloadSchema,
  RefreshToken,
  refreshTokenSchema,
  ServiceError,
} from '@transcenders/contracts';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from './env.hook.js';

export class TokenValidator {
  static verifyAccessToken(token: string, expectedUser?: number): JWTPayload {
    return this.verifyToken(token, false, expectedUser);
  }

  static verifyRefreshToken(token: string, expectedUser?: number): JWTPayload {
    return this.verifyToken(token, true, expectedUser);
  }

  private static verifyToken(
    token: string,
    isRefreshToken: boolean,
    expectedUser?: number,
  ): JWTPayload {
    const secret = isRefreshToken ? this.getRefreshSecret() : this.getAccessSecret();

    try {
      const payload = jwt.verify(token, secret);
      Value.Assert(JWTPayloadSchema, payload);

      if (expectedUser && payload.userId !== expectedUser) {
        throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
          jti: payload.jti,
          reason: 'Token does not belong to the authenticated user',
          expectedUserId: expectedUser,
          tokenUserId: payload.userId,
        });
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
          {
            originalMessage: error.message,
            expiredAt: error.expiredAt,
          },
          error,
        );
      }
      if (error instanceof Error) {
        throw new ServiceError(
          ERROR_CODES.AUTH.INVALID_TOKEN_STRUCTURE,
          { originalMessage: error.message },
          error,
        );
      }

      // rest of the errors with some context
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_TOKEN_STRUCTURE, {
        originalMessage: String(error),
      });
    }
  }

  static async authenticateRefreshToken(
    refreshToken: string,
    storedToken: unknown,
  ): Promise<RefreshToken> {
    if (!storedToken) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
        reason: 'Refresh token not found in database',
      });
    }

    if (!Value.Check(refreshTokenSchema, storedToken)) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
        reason: 'Invalid refresh token database structure',
      });
    }

    if (storedToken.revoked_at !== null) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
        jti: storedToken.jti,
        reason: 'Refresh token has been revoked',
        revokedAt: storedToken.revoked_at,
      });
    }

    const isValidToken = await bcrypt.compare(refreshToken, storedToken.token_hash);
    if (!isValidToken) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, {
        jti: storedToken.jti,
        reason: 'Refresh token hash mismatch',
      });
    }
    return storedToken;
  }

  static getAccessSecret(): string {
    const secret = ENV.JWT_ACCESS_SECRET ?? 'access';
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is required');
    }
    return secret;
  }

  static getRefreshSecret(): string {
    const secret = ENV.JWT_REFRESH_SECRET ?? 'refresh';
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return secret;
  }
}
