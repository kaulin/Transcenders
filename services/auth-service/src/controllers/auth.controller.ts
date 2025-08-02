import {
  ApiErrorHandler,
  ChangePasswordRequest,
  GoogleAuthCallback,
  LoginUser,
  LogoutUser,
  RefreshTokenRequest,
  RegisterUser,
  userByIdRequest,
} from '@transcenders/contracts';
import { DeviceUtils } from '@transcenders/server-utils';
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

  static async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    const url = AuthService.getGoogleAuthUrl();
    reply.redirect(url);
  }

  static async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    const { code } = request.query as GoogleAuthCallback;
    const deviceInfo = DeviceUtils.extractDeviceInfo(request);
    const result = await AuthService.handleGoogleCallback(code, deviceInfo);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
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
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const result = await AuthService.deleteCredentials(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const { oldPassword, newPassword } = request.body as ChangePasswordRequest;

    const result = await AuthService.changePassword(userId, oldPassword, newPassword);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
