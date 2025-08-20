import {
  ApiErrorHandler,
  ChangePasswordRequest,
  ERROR_CODES,
  GoogleAuthCallback,
  GoogleFlowParam,
  GoogleFlows,
  GoogleUserLogin,
  LoginUser,
  LogoutUser,
  RefreshTokenRequest,
  RegisterUser,
  StepupRequest,
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
    if (result.success) {
      return reply.redirect(result.data);
    }
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    const { code, state, error } = request.query as GoogleAuthCallback;
    const params = new URLSearchParams();
    params.set('type', state);

    if (code) params.set('code', code);
    if (error) params.set('error', ERROR_CODES.AUTH.GOOGLE_AUTH_FAILED);
    return reply.redirect(`${ENV.FRONTEND_URL}/callback?${params.toString()}`);
  }

  static async googleLogin(request: FastifyRequest, reply: FastifyReply) {
    const { code } = request.body as GoogleUserLogin;
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const result = await AuthService.googleLogin(code, deviceInfo);
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
}
