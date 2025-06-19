import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/GatewayService';

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const result = await GatewayService.forward(AUTH_URL, request, '/auth/register');
    reply.status(result.status).type(result.contentType ?? 'application/json').send(result.body);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const result = await GatewayService.forward(AUTH_URL, request, '/auth/login');
    reply.status(result.status).type(result.contentType ?? 'application/json').send(result.body);
  }

  static async changePassword(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/auth/change-password/${request.params.id}`;
    const result = await GatewayService.forward(AUTH_URL, request, path);
    reply.status(result.status).type(result.contentType ?? 'application/json').send(result.body);
  }

  static async deleteCredentials(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/auth/credentials/${request.params.id}`;
    const result = await GatewayService.forward(AUTH_URL, request, path);
    reply.status(result.status).type(result.contentType ?? 'application/json').send(result.body);
  }
}