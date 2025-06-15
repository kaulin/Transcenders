import {
  LoginUser,
  RegisterUser,
  ResponseHelper,
  UpdateUserCredentials,
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
  static async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const updates = request.body as Partial<UpdateUserCredentials>;

    const result = await AuthService.updateCredentials(userId, updates);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
  static async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const result = await AuthService.deleteCredentials(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
