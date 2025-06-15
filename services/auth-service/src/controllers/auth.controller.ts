import { LoginUser, RegisterUser, ResponseHelper } from '@transcenders/contracts';
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
}
