import {
  ApiResponseType,
  SCORE_ROUTES,
  SERVICE_URLS,
} from '@transcenders/contracts';
import { ApiClient } from '../api/ApiClient';
import { ApiCallOptions } from '../types/client.options';

export class ScoreApiService {
  /**
   * Internal method to call the score service
   */
  private static async callScoreService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.SCORE}${endpoint}`;
    return ApiClient.call(url, options);
  }
  
  /**
   * Gets a list of users based on optional query parameters
   */
  static async getUsers(query?: GetUsersQuery) {
    const queryString = query ? toQueryString(query) : '';
    return this.callUserService(`${USER_ROUTES.USERS}${queryString}`);
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
    return this.callAuthService(endpoint, options);
  }

  static async login(login: LoginUser) {
    const endpoint = `${AUTH_ROUTES.LOGIN}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: login,
    };
    return this.callAuthService(endpoint, options);
  }
}
