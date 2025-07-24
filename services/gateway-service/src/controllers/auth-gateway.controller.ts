import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/gateway.service';
import { SERVICE_URLS } from '../urls';
import { AUTH_ROUTES } from '@transcenders/contracts';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(request, reply, SERVICE_URLS.AUTH, AUTH_ROUTES.REGISTER);
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(request, reply, SERVICE_URLS.AUTH, AUTH_ROUTES.LOGIN);
  }

  static async changePassword(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const path = `/auth/change-password/${request.params.id}`;
    await GatewayService.forwardAndReply(request, reply, SERVICE_URLS.AUTH, path);
  }

  static async deleteCredentials(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const path = `/auth/credentials/${request.params.id}`;
    await GatewayService.forwardAndReply(request, reply, SERVICE_URLS.AUTH, path);
  }
}
