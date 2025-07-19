import { ApiResponseType } from '@transcenders/contracts';
import { AuthApiService } from '../services/auth.service';
import { ScoreApiService } from '../services/score.service';
import { UserApiService } from '../services/user.service';
import { ApiCallOptions } from '../types/client.options';

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

  static user = UserApiService;
  static auth = AuthApiService;
  static score = ScoreApiService;
}
