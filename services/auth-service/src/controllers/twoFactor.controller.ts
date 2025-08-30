import { TwoFactorRequest, TwoFactorVerify, UserIdParam } from '@transcenders/contracts';
import { ApiErrorHandler } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { TwoFactorService } from '../services/twoFactor.service.js';

export class TwoFactorController {
  static async requestEnroll(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { email } = request.body as TwoFactorRequest;
    const result = await TwoFactorService.requestEnroll(userId, email);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async enable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as TwoFactorVerify;
    const result = await TwoFactorService.enable(userId, code);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async requestStepup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const result = await TwoFactorService.requestStepup(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async requestLogin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const result = await TwoFactorService.requestLogin(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as TwoFactorVerify;
    const result = await TwoFactorService.login(userId, code);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async requestDisable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const result = await TwoFactorService.requestDisable(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async disable(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as TwoFactorVerify;
    const result = await TwoFactorService.disable(userId, code);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async enabled(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const result = await TwoFactorService.getEnabled(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
