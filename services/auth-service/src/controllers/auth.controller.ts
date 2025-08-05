import {
  ApiErrorHandler,
  ChangePasswordRequest,
  DeviceInfo,
  GoogleAuthCallback,
  GoogleFlows,
  GoogleUserSetPassword,
  LoginUser,
  LogoutUser,
  RefreshTokenRequest,
  RegisterUser,
  TwoFactorEnable,
  TwoFactorVerify,
  UserIdParam,
} from '@transcenders/contracts';
import { DeviceUtils, ENV } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.register(request.body as RegisterUser);
    return ApiErrorHandler.handleServiceResult(reply, result, 201);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const result = await AuthService.login(request.body as LoginUser, deviceInfo);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async googleAuthLogin(request: FastifyRequest, reply: FastifyReply) {
    const url = AuthService.getGoogleAuthUrl('login');
    reply.redirect(url);
  }

  static async googleSetPassword(request: FastifyRequest, reply: FastifyReply) {
    const url = AuthService.getGoogleAuthUrl('login');
    reply.redirect(url);
  }

  static async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    const { code, state } = request.query as GoogleAuthCallback;
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);

    try {
      switch (state) {
        case 'login':
          await this.handleLoginCallback(code, state, deviceInfo, reply);
          break;
        case 'set-password':
          await this.handleSetPasswordCallback(code, state, reply);
          break;
        case 'config-change':
          await this.handleConfigChangeCallback(code, state, reply);
          break;
        default:
          reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=error&error=invalid_state`);
          break;
      }
    } catch (error) {
      reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=error&error=server_error`);
    }
  }

  private static async handleLoginCallback(
    code: string,
    type: GoogleFlows,
    deviceInfo: DeviceInfo,
    reply: FastifyReply,
  ) {
    const result = await AuthService.handleGoogleCallback(code, deviceInfo);
    if (result.success) {
      const tokens = encodeURIComponent(JSON.stringify(result.data));
      reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=${type}&tokens=${tokens}`);
    } else {
      reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=error&error=auth_failed`);
    }
  }

  private static async handleSetPasswordCallback(
    code: string,
    type: GoogleFlows,
    reply: FastifyReply,
  ) {
    reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=${type}&code=${code}`);
  }

  private static async handleConfigChangeCallback(
    code: string,
    type: GoogleFlows,
    reply: FastifyReply,
  ) {
    reply.redirect(`${ENV.FRONTEND_URL}/auth/callback?type=${type}&code=${code}`);
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { refreshToken } = request.body as LogoutUser;
    const result = await AuthService.logout(userId, refreshToken);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as RefreshTokenRequest;
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const result = await AuthService.refreshToken(refreshToken, deviceInfo);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const result = await AuthService.deleteCredentials(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { oldPassword, newPassword } = request.body as ChangePasswordRequest;

    const result = await AuthService.changePassword(userId, oldPassword, newPassword);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async twoFactorEnable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { email } = request.body as TwoFactorEnable;

    const result = await AuthService.twoFactorEnable(userId, email);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async twoFactorVerify(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as TwoFactorVerify;

    const result = await AuthService.twoFactorVerify(userId, code);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async twoFactorDisable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);

    const result = await AuthService.twoFactorDisable(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
