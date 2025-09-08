import {
  ChangePasswordRequest,
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

    // Handle error case
    if (error || !code) {
      const params = new URLSearchParams();
      params.set('error', 'google_auth_failed');
      return reply.redirect(`${ENV.FRONTEND_URL}/login?${params.toString()}`);
    }

    try {
      const flow = state as GoogleFlows;

      if (flow === 'login') {
        const deviceInfo = DeviceUtils.extractDeviceInfo(request);
        const loginResult = await AuthService.googleLogin(code, deviceInfo);

        if (loginResult.success) {
          CookieUtils.handleLoginResponse(reply, loginResult);
          return reply.redirect(`${ENV.FRONTEND_URL}/`);
        } else {
          // Login failed, redirect to login with error
          const params = new URLSearchParams();
          params.set('error', 'google_login_failed');
          return reply.redirect(`${ENV.FRONTEND_URL}/login?${params.toString()}`);
        }
      } else if (flow === 'stepup' || flow === 'connect') {
        // For stepup and connect flows, still pass the code to frontend
        const params = new URLSearchParams();
        params.set('type', state);
        params.set('code', code);
        return reply.redirect(`${ENV.FRONTEND_URL}/callback?${params.toString()}`);
      } else {
        // Unknown flow
        const params = new URLSearchParams();
        params.set('error', 'invalid_flow');
        return reply.redirect(`${ENV.FRONTEND_URL}/login?${params.toString()}`);
      }
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      const params = new URLSearchParams();
      params.set('error', 'google_auth_failed');
      return reply.redirect(`${ENV.FRONTEND_URL}/login?${params.toString()}`);
    }
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
    const loginResult = await AuthService.refreshToken(refreshToken, deviceInfo);
    const result = CookieUtils.handleLoginResponse(reply, loginResult);
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
