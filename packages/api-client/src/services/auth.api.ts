import { Static, TSchema } from '@sinclair/typebox';
import {
  AUTH_ROUTES,
  authDataAccessOnlySchema,
  authDataSchema,
  BooleanOperationResultSchema,
  ChangePasswordRequest,
  GoogleFlows,
  LoginUser,
  RegisterUser,
  SERVICE_URLS,
  StepupRequest,
  TWO_FACTOR_ROUTES,
  twoFactorChallengeRequestedSchema,
  TwoFactorRequest,
  TwoFactorVerify,
  userCredentialsInfoSchema,
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

  static async changePassword(userId: number, newPassword: string) {
    const endpoint = `${AUTH_ROUTES.CHANGE_PASSWORD.replace(':id', userId.toString())}`;
    const body: ChangePasswordRequest = { newPassword };
    const options: ApiCallOptions = {
      method: 'PATCH',
      body,
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  static async getUserCredsInfo(userId: number) {
    const endpoint = `${AUTH_ROUTES.CREDS.replace(':id', userId.toString())}`;
    return this.callAuthService(endpoint, userCredentialsInfoSchema);
  }

  static async getCurrentUser() {
    const endpoint = `${AUTH_ROUTES.ME}`;
    return this.callAuthService(endpoint, userSchema);
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
    const state: GoogleFlows = 'stepup';
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

  static async googleConnect(userId: number, code: string) {
    const endpoint = `${AUTH_ROUTES.GOOGLE_CONNECT.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: { code },
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  private static async stepup(userId: number, stepup: StepupRequest) {
    const endpoint = `${AUTH_ROUTES.STEPUP.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
      body: stepup,
    };
    return this.callAuthService(endpoint, authDataAccessOnlySchema, options);
  }

  static async stepup2fa(userid: number, code: string) {
    const stepup: StepupRequest = { method: '2fa', code };
    return await this.stepup(userid, stepup);
  }

  static async stepupGoogle(userid: number, googleCode: string) {
    const stepup: StepupRequest = { method: 'google', googleCode };
    return await this.stepup(userid, stepup);
  }

  static async stepupPassword(userid: number, password: string) {
    const stepup: StepupRequest = { method: 'password', password };
    return await this.stepup(userid, stepup);
  }

  static async twoFacEnabled(userId: number) {
    const endpoint = `${TWO_FACTOR_ROUTES.ENABLED.replace(':id', userId.toString())}`;
    return this.callAuthService(endpoint, BooleanOperationResultSchema);
  }

  static async twoFacRequestEnroll(userId: number, email: string) {
    const endpoint = `${TWO_FACTOR_ROUTES.REQUEST_ENROLL.replace(':id', userId.toString())}`;
    const body: TwoFactorRequest = { email };
    const options: ApiCallOptions = {
      method: 'POST',
      body,
    };
    return this.callAuthService(endpoint, twoFactorChallengeRequestedSchema, options);
  }

  static async twoFacEnable(userId: number, code: string) {
    const endpoint = `${TWO_FACTOR_ROUTES.ENABLE.replace(':id', userId.toString())}`;
    const body: TwoFactorVerify = { code };
    const options: ApiCallOptions = {
      method: 'POST',
      body,
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  static async twoFacRequestStepup(userId: number) {
    const endpoint = `${TWO_FACTOR_ROUTES.REQUEST_STEPUP.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
    };
    return this.callAuthService(endpoint, twoFactorChallengeRequestedSchema, options);
  }

  static async twoFacRequestLogin(userId: number) {
    const endpoint = `${TWO_FACTOR_ROUTES.REQUEST_LOGIN.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
    };
    return this.callAuthService(endpoint, twoFactorChallengeRequestedSchema, options);
  }

  static async twoFacLogin(userId: number, code: string) {
    const endpoint = `${TWO_FACTOR_ROUTES.LOGIN.replace(':id', userId.toString())}`;
    const body: TwoFactorVerify = { code };
    const options: ApiCallOptions = {
      method: 'POST',
      body,
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }

  static async twoFacRequestDisable(userId: number) {
    const endpoint = `${TWO_FACTOR_ROUTES.REQUEST_DISABLE.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = {
      method: 'POST',
    };
    return this.callAuthService(endpoint, twoFactorChallengeRequestedSchema, options);
  }

  static async twoFacDisable(userId: number, code: string) {
    const endpoint = `${TWO_FACTOR_ROUTES.DISABLE.replace(':id', userId.toString())}`;
    const body: TwoFactorVerify = { code };
    const options: ApiCallOptions = {
      method: 'POST',
      body,
    };
    return this.callAuthService(endpoint, BooleanOperationResultSchema, options);
  }
}
