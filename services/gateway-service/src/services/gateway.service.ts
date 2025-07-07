import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponseType } from '@transcenders/contracts';

export class GatewayService {
  static async forward(
    req: FastifyRequest,
    serviceUrl: string,
    path: string,
  ): Promise<{ status: number; body: ApiResponseType }> {
    const url = `${serviceUrl}${path}`;
    const method = req.method;
    const res = await fetch(url, {
      method,
      headers: req.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(req.body),
    });
    const body: ApiResponseType = await res.json();
    return {
      status: res.status,
      body,
    };
  }

  static async forwardAndReply(
    req: FastifyRequest,
    reply: FastifyReply,
    serviceUrl: string,
    path: string,
  ) {
    try {
      const { status, body } = await this.forward(req, serviceUrl, path);
      reply.status(status).send(body);
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        operation: path,
        error: error?.message ?? 'Unexpected gateway error',
      } satisfies ApiResponseType);
    }
  }
}
