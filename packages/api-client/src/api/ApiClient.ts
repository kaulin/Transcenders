import { ApiResponseType } from '@transcenders/contracts';
import { AuthApiClient } from '../services/auth.api.js';
import { ScoreApiClient } from '../services/score.api.js';
import { UserApiClient } from '../services/user.api.js';
import { ApiCallOptions } from '../types/client.options.js';

export class ApiClient {
  /**
   * Simple HTTP client for helpers
   */
  static async call(url: string, options: ApiCallOptions = {}): Promise<ApiResponseType> {
    const { method = 'GET', body, headers = {}, timeout = 20000 } = options;

    const requestInit: RequestInit = {
      method,
      headers: {
        ...headers,
      },
      //#TODO temporary disabled timeout for debugging
      // signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestInit.body = body;
      } else {
        requestInit.headers = {
          'Content-Type': 'application/json',
          ...requestInit.headers,
        };
        requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
    }

    console.log(`API Call: ${method} ${url}`);
    const response = await fetch(url, requestInit);
    const data = await response.json();
    return data as ApiResponseType;
  }

  static user = UserApiClient;
  static auth = AuthApiClient;
  static score = ScoreApiClient;
}
