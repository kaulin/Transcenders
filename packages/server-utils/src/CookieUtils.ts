import { CookieSerializeOptions } from '@fastify/cookie';
import {
  AuthData,
  ERROR_CODES,
  isSuccessResult,
  LoginResult,
  ServiceError,
  ServiceResult,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';

export class CookieUtils {
  private static cookiePathCsrf = '/';
  private static cookiePathRt = '/api/auth';
  private static cookieAge = 60 * 60 * 24 * 30; // 30 days

  static setCookies(reply: FastifyReply, refreshToken: string) {
    this.setRtCookie(reply, refreshToken);
    this.setCsrfCookie(reply);
  }

  static setRtCookie(reply: FastifyReply, refreshToken: string) {
    const rtOptions: CookieSerializeOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: this.cookiePathRt,
      maxAge: this.cookieAge,
    };
    reply.setCookie('rt', refreshToken, rtOptions);
  }

  static setCsrfCookie(reply: FastifyReply) {
    const csrfOptions: CookieSerializeOptions = {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: this.cookiePathCsrf,
      maxAge: this.cookieAge,
    };
    reply.setCookie('csrf', crypto.randomUUID(), csrfOptions);
  }

  static clearCookies(reply: FastifyReply) {
    reply.setCookie('rt', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: this.cookiePathRt,
      maxAge: 0,
    });
    reply.setCookie('csrf', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: this.cookiePathCsrf,
      maxAge: 0,
    });
  }

  static handleLoginResponse(
    reply: FastifyReply,
    loginResult: ServiceResult<LoginResult>,
  ): ServiceResult<AuthData> {
    if (isSuccessResult(loginResult) && !loginResult.data.justVerify) {
      this.setCookies(reply, loginResult.data.refreshToken);

      // return AuthData with removed refreshToken to respond with
      return {
        ...loginResult,
        data: {
          accessToken: loginResult.data.accessToken,
          expiresIn: loginResult.data.expiresIn,
          userId: loginResult.data.userId,
        },
      };
    }
    // error case
    return loginResult;
  }

  static requireCsrf() {
    return async (request: FastifyRequest) => {
      const header = request.headers['x-csrf-token'];
      const csrf = request.cookies.csrf;
      if (!header || header !== csrf) {
        throw new ServiceError(ERROR_CODES.AUTH.COOKIE_ERROR, {
          reason: 'CSRF validation failed',
        });
      }
    };
  }

  static requireRefreshToken() {
    return async (request: FastifyRequest) => {
      const refreshToken = request.cookies.rt;
      if (!refreshToken) {
        throw new ServiceError(ERROR_CODES.AUTH.COOKIE_ERROR, {
          reason: 'No refresh token cookie',
        });
      }
    };
  }
}
