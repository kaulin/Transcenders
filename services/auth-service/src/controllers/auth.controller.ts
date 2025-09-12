import {
  ChangePasswordRequest,
  decodeToken,
  GoogleAuthCallback,
  GoogleFlowParam,
  GoogleFlows,
  GoogleUserLogin,
  LoginUser,
  RegisterUser,
  StepupRequest,
  UserIdParam,
} from '@transcenders/contracts';
import { ApiErrorHandler, CookieUtils, DeviceUtils, ENV } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.register(request.body as RegisterUser);
    return ApiErrorHandler.handleServiceResult(reply, result, 201);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const loginInfo = request.body as LoginUser;
    const loginResult = await AuthService.login(loginInfo, deviceInfo);
    const result = CookieUtils.handleLoginResponse(reply, loginResult);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async stepup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const stepupRequest = request.body as StepupRequest;
    const result = await AuthService.stepup(userId, stepupRequest);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    const { flow } = request.params as GoogleFlowParam;
    const result = await AuthService.getGoogleAuthUrl(flow as GoogleFlows);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    const { code, state, error } = request.query as GoogleAuthCallback;
    const flow = state as GoogleFlows;
    const params = new URLSearchParams();
    let result = flow === 'login' ? '/login' : '/profile';

    try {
      if (error || !code) {
        throw error;
      }
      switch (flow) {
        case 'login':
          const deviceInfo = DeviceUtils.extractDeviceInfo(request);
          const loginResult = await AuthService.googleLogin(code, deviceInfo);
          CookieUtils.handleLoginResponse(reply, loginResult);
          result = '/login';
          break;

        case 'stepup':
          result = `/profile`;
          params.set('code', code);
          break;

        case 'connect':
          const refreshToken = request.cookies.rt;
          if (!refreshToken) {
            result = '/login';
            params.set('error', 'auth_required');
            break;
          }
          const userId = decodeToken(refreshToken).userId;
          const connectResult = await AuthService.googleConnect(userId, code);
          result = '/profile';
          if (!connectResult.success) {
            params.set('error', connectResult.error.localeKey ?? 'google_auth_failed');
          }
          break;

        default:
          result = '/login';
      }
    } catch {
      result = '/login';
      params.set('error', 'google_auth_failed');
    }
    const resultUrl = `${ENV.FRONTEND_URL}${result}?${params.toString()}`;
    return reply.redirect(resultUrl);
  }

  static async googleLogin(request: FastifyRequest, reply: FastifyReply) {
    const { code } = request.body as GoogleUserLogin;
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const loginResult = await AuthService.googleLogin(code, deviceInfo);
    const result = CookieUtils.handleLoginResponse(reply, loginResult);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async googleConnect(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as GoogleUserLogin;
    const result = await AuthService.googleConnect(userId, code);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const refreshToken = request.cookies.rt;
    const result = await AuthService.logout(userId, refreshToken);
    CookieUtils.clearCookies(reply);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const refreshToken = request.cookies.rt;
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
    const { newPassword } = request.body as ChangePasswordRequest;

    const result = await AuthService.changePassword(userId, newPassword);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getUserCredsInfo(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);

    const result = await AuthService.getUserCredsInfo(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.userId;
    const result = await AuthService.getCurrentUser(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
