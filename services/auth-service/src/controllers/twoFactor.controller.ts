import {
  ApiErrorHandler,
  TwoFactorEnable,
  TwoFactorVerify,
  UserIdParam,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { TwoFactorService } from '../services/twoFactor.service.js';

export class TwoFactorController {
  static async enroll(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { email } = request.body as TwoFactorEnable;
    const result = await TwoFactorService.requestEnroll(userId, email);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async verifyEnroll(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as UserIdParam;
    const userId = parseInt(id);
    const { code } = request.body as TwoFactorVerify;
    const result = await TwoFactorService.enroll(userId, code);
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
}
