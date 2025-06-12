import { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { FRIENDSHIP_ROUTES, SERVICE_URLS, USER_ROUTES } from './routes.js';
import {
  ApiResponse,
  ApiResponseType,
  CreateUserRequest,
  GetUserRequest,
  GetUsersQuery,
  UserSchema,
} from './user.schemas.js';
import { toQueryString } from './utils/query.js';

export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string | object;
  headers?: Record<string, string>;
  timeout?: number;
  expectedDataSchema?: TSchema;
}

export class ApiClient {
  /**
   * Enhanced main call function
   */
  static async call(url: string, options: ApiCallOptions = {}): Promise<ApiResponseType> {
    const { method = 'GET', body, headers = {}, timeout = 5000, expectedDataSchema } = options;

    try {
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(timeout),
      };

      if (body && method !== 'GET') {
        requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
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

  /**
   * Service-specific call methods
   */
  static async callUserService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.USER}${endpoint}`;
    return this.call(url, options);
  }

  static async callAuthService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.AUTH}${endpoint}`;
    return this.call(url, options);
  }
  /**
   * Convenience methods using route constants
   */
  static async getUsers(query?: GetUsersQuery) {
    const queryString = query ? toQueryString(query) : '';
    return this.callUserService(`${USER_ROUTES.USERS}${queryString}`);
  }

  static async createUser(userData: CreateUserRequest) {
    return this.callUserService(USER_ROUTES.USERS, {
      method: 'POST',
      body: userData,
    });
  }

  static async getUserById(id: number) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()));
  }

  static async updateUser(id: number, userData: object) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()), {
      method: 'PATCH',
      body: userData,
    });
  }

  static async deleteUser(id: number) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()), {
      method: 'DELETE',
    });
  }

  static async checkUserExists(identifier: string) {
    return this.callUserService(USER_ROUTES.USER_EXISTS.replace(':identifier', identifier));
  }

  static async getUserExact(query: GetUserRequest) {
    const queryString = `?${new URLSearchParams(query).toString()}`;
    return this.callUserService(`${USER_ROUTES.USERS_EXACT}${queryString}`, {
      expectedDataSchema: UserSchema,
    });
  }

  // Friendship methods
  static async getFriends(userId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.USER_FRIENDSHIPS.replace(':id', userId.toString()),
    );
  }

  static async sendFriendRequest(userId: number, recipientId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':recipientId',
        recipientId.toString(),
      ),
      { method: 'POST' },
    );
  }

  static async acceptFriendRequest(userId: number, requestId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':requestId',
        requestId.toString(),
      ),
      { method: 'PUT' },
    );
  }

  static async declineFriendRequest(userId: number, requestId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':requestId',
        requestId.toString(),
      ),
      { method: 'DELETE' },
    );
  }

  static async removeFriend(userId: number, friendId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIENDSHIP.replace(':id', userId.toString()).replace(
        ':friendId',
        friendId.toString(),
      ),
      { method: 'DELETE' },
    );
  }

  /**
   * Utility methods
   */
  private static errorResponse(error: string): ApiResponseType {
    return {
      success: false,
      operation: 'api-call',
      error,
    };
  }
}
