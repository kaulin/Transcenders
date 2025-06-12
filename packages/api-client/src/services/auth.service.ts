import { ApiResponse, AUTH_ROUTES, SERVICE_URLS } from '@transcenders/contracts';
import { ApiClient } from '../api/ApiClient';
import { ApiCallOptions } from '../types/client.options';

export class AuthApiService {
  /**
   * Internal method to call the auth service
   */
  private static async callAUthService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponse> {
    const url = `${SERVICE_URLS.AUTH}${endpoint}`;
    return ApiClient.call(url, options);
  }

  /**
   * Gets a list of users based on optional query parameters
   * #TODO register() input/request type
   */

  static async register(username: string, password: string) {
    const endpoint = `${AUTH_ROUTES.AUTH.replace(':username', username).replace(
      ':password',
      password,
    )}`;
    return this.callAUthService(endpoint);
  }
}
