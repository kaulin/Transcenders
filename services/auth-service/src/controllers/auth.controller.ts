import {
  ChangePasswordRequest,
  LoginUser,
  RegisterUser,
  ResponseHelper,
  userByIdRequest,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service';

export class AuthController {
  // UserController
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.register(request.body as RegisterUser);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.login(request.body as LoginUser);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const result = await AuthService.deleteCredentials(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const { oldPassword, newPassword } = request.body as ChangePasswordRequest;

    const result = await AuthService.changePassword(userId, oldPassword, newPassword);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
