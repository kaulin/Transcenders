import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service';

export class AuthController {
  // UserController
  static async auth(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.params as { username: string; password: string };
    const result = await AuthService.login(username, password);
    return result;
  }
}
