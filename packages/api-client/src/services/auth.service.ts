import {
  ApiResponseType,
  AUTH_ROUTES,
  LoginUser,
  RegisterUser,
  SERVICE_URLS,
} from '@transcenders/contracts';
import { ApiClient } from '../api/ApiClient';
import { ApiCallOptions } from '../types/client.options';

export class AuthApiService {
  /**
   * Internal method to call the auth service
   */
  private static async callAUthService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.AUTH}${endpoint}`;
    return ApiClient.call(url, options);
  }

  /**
   * Gets a list of users based on optional query parameters
   * TODO register() input/request type
   */

  static async register(registration: RegisterUser) {
    const endpoint = `${AUTH_ROUTES.REGISTER}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: registration,
    };
    return this.callAUthService(endpoint, options);
  }

  static async login(login: LoginUser) {
    const endpoint = `${AUTH_ROUTES.LOGIN}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: login,
    };
    return this.callAUthService(endpoint, options);
  }
}
