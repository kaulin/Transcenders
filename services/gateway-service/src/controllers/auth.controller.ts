import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/GatewayService';

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(AUTH_URL, request, reply, '/auth/register');
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(AUTH_URL, request, reply, '/auth/login');
  }

  static async changePassword(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/auth/change-password/${request.params.id}`;
    await GatewayService.forwardAndReply(AUTH_URL, request, reply, path);
  }

  static async deleteCredentials(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/auth/credentials/${request.params.id}`;
    await GatewayService.forwardAndReply(AUTH_URL, request, reply, path);
  }
}