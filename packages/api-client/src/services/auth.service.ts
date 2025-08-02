import { Static, TSchema } from '@sinclair/typebox';
import {
  AUTH_ROUTES,
  authDataSchema,
  BooleanOperationResultSchema,
  LoginUser,
  RegisterUser,
  SERVICE_URLS,
  UserSchema,
} from '@transcenders/contracts';
import { TypedApiClient } from '../api/TypedApiClient.js';
import { ApiCallOptions } from '../types/client.options.js';

export class AuthApiService extends TypedApiClient {
  /**
   * Internal method to call the auth service
   */
  private static async callAuthService<T extends TSchema>(
    endpoint: string,
    schema: T,
    options: ApiCallOptions = {},
  ): Promise<Static<T>> {
    const url = `${SERVICE_URLS.AUTH}${endpoint}`;
    return this.callTyped(url, schema, options);
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
    return this.callAuthService(endpoint, UserSchema, options);
  }

  static async login(login: LoginUser) {
    const endpoint = `${AUTH_ROUTES.LOGIN}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: login,
    };
    return this.callAuthService(endpoint, authDataSchema, options);
  }

  static async privateDelete(id: number) {
    const endpoint = `${AUTH_ROUTES.DELETE.replace(':id', id.toString())}`;
    const options: ApiCallOptions = {
      method: 'DELETE',
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const endpoint = `${AUTH_ROUTES.CHANGE_PASSWORD.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'PATCH',
      body: { oldPassword, newPassword },
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  static async refreshToken(refreshToken: string) {
    const endpoint = `${AUTH_ROUTES.REFRESH}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: { refreshToken },
    };
    return this.callAuthService(endpoint, authDataSchema, options);
  }

  static async logout(userId: number, refreshToken: string) {
    const endpoint = `${AUTH_ROUTES.LOGOUT.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: { refreshToken },
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }
}
