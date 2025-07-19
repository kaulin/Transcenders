import { Value } from '@sinclair/typebox/value';
import { ApiResponse, ApiResponseType } from '@transcenders/contracts';
import { AuthApiService } from '../services/auth.service';
import { ScoreApiService } from '../services/score.service';
import { UserApiService } from '../services/user.service';
import { ApiCallOptions } from '../types/client.options';

export class ApiClient {
  /**
   * Enhanced main call function
   */
  static async call(url: string, options: ApiCallOptions = {}): Promise<ApiResponseType> {
    const { method = 'GET', body, headers = {}, timeout = 20000, expectedDataSchema } = options;

    try {
      const requestInit: RequestInit = {
        method,
        headers: {
          ...headers,
        },
        signal: AbortSignal.timeout(timeout),
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

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return this.errorResponse(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return this.errorResponse('Response is not JSON');
      }

      const data = await response.json();

      // Validate response format
      if (!Value.Check(ApiResponse, data)) {
        console.error('Invalid response format:', data);
        return this.errorResponse('Invalid response format from service');
      }

      // Validate expected data schema if provided
      if (data.success && expectedDataSchema) {
        if (!Value.Check(expectedDataSchema, data.data)) {
          console.error('Data schema validation failed:', data.data);
          return this.errorResponse('Response data does not match expected schema');
        }
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return this.errorResponse(`Request timeout after ${timeout}ms`);
        }
        return this.errorResponse(error.message);
      }

      return this.errorResponse('Network error');
    }
  }

  private static errorResponse(error: string): ApiResponseType {
    return {
      success: false,
      operation: 'api-call',
      error: {
        code: 'API_CLIENT_ERROR',
        message: error,
        category: 'internal',
      },
      timestamp: new Date().toISOString(),
    };
  }

  static user = UserApiService;
  static auth = AuthApiService;
  static score = ScoreApiService;
}
