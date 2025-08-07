import { Static, TSchema } from '@sinclair/typebox';
import {
  AUTH_ROUTES,
  authDataSchema,
  BooleanOperationResultSchema,
  GoogleFlows,
  GoogleUserSetPassword,
  LoginUser,
  RegisterUser,
  SERVICE_URLS,
  userSchema,
} from '@transcenders/contracts';
import { TypedApiClient } from '../api/TypedApiClient.js';
import { ApiCallOptions } from '../types/client.options.js';

export class AuthApiClient extends TypedApiClient {
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
    return this.callAuthService(endpoint, userSchema, options);
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

  // reroutes to google-auth picker, and then to the /callback with /callback?type=${state}&code=${code}
  // type is just a string value of what google auth was initiated with GoogleFlows type
  // code is the 1-time use code that google returns on successful auth that can be used for our google code based endpoints
  static async googleAuthLogin(): Promise<void> {
    const state: GoogleFlows = 'login';
    const endpoint = `${AUTH_ROUTES.GOOGLE_AUTH.replace(':flow', state)}`;
    this.callAuthService(endpoint, BooleanOperationResultSchema);
  }

  static async googleAuthSetPassword(): Promise<void> {
    const state: GoogleFlows = 'set-password';
    const endpoint = `${AUTH_ROUTES.GOOGLE_AUTH.replace(':flow', state)}`;
    this.callAuthService(endpoint, BooleanOperationResultSchema);
  }

  static async googleLogin(code: string) {
    const endpoint = `${AUTH_ROUTES.GOOGLE_LOGIN}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: { code },
    };
    return this.callAuthService(endpoint, authDataSchema, options);
  }

  static async googleSetPassword(userId: number, googleSetPassword: GoogleUserSetPassword) {
    const endpoint = `${AUTH_ROUTES.GOOGLE_LOGIN.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: googleSetPassword,
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }
}
