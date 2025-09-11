import { ApiResponseType, getEnvVar } from '@transcenders/contracts';
import { AdminApiClient } from '../services/admin.api.js';
import { AuthApiClient } from '../services/auth.api.js';
import { ScoreApiClient } from '../services/score.api.js';
import { UserApiClient } from '../services/user.api.js';
import { ApiCallOptions } from '../types/client.options.js';

export class ApiClient {
  private static authHeader?: string;
  private static bypassUserId?: number;

  static setAuthToken(token?: string) {
    this.authHeader = token ? `Bearer ${token}` : undefined;
  }

  // For development/testing
  static setAuthBypass(userId?: number) {
    this.bypassUserId = userId;
  }
  /**
   * Simple HTTP client for helpers
   */
  static async call(url: string, options: ApiCallOptions = {}): Promise<ApiResponseType> {
    const { method = 'GET', body, headers = {}, timeout = 20000 } = options;

    const hdrs = new Headers(headers);

    if (this.bypassUserId !== undefined) {
      hdrs.set('x-auth-bypass', this.bypassUserId.toString());
    }
    if (this.authHeader && !hdrs.has('authorization')) {
      hdrs.set('Authorization', this.authHeader);
    }
    if (!hdrs.has('accept')) {
      hdrs.set('Accept', 'application/json');
    }

    const requestInit: RequestInit = {
      method,
      headers: hdrs,
      // signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestInit.body = body;
      } else {
        if (!hdrs.has('content-type')) {
          hdrs.set('Content-Type', 'application/json');
        }
        requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
    }

    if (getEnvVar('NODE_ENV', 'development') == 'development') {
      console.log(`API Call: ${method} ${url}`);
    }
    const response = await fetch(url, requestInit);
    const data = await response.json();
    return data as ApiResponseType;
  }

  static user = UserApiClient;
  static auth = AuthApiClient;
  static score = ScoreApiClient;
  static admin = AdminApiClient;
}
