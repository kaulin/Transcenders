import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponseType, SERVICE_URLS, TimestampField } from '@transcenders/contracts';

const serviceMap: Record<string, string> = {
  '/auth': SERVICE_URLS.AUTH,
  '/users': SERVICE_URLS.USER,
  '/avatar': SERVICE_URLS.USER,
  '/friendship': SERVICE_URLS.USER,
  '/score': SERVICE_URLS.SCORE,
};

export class GatewayService {
  static async forward(req: FastifyRequest, reply: FastifyReply) {
    const path = req.url;
    const prefix = Object.keys(serviceMap).find((p) => path.startsWith(p));

    if (!prefix) {
      reply.status(502).send({ error: 'Service not available for this path' });
      return;
    }

    const targetBaseUrl = serviceMap[prefix];
    const targetUrl = `${targetBaseUrl}${path}`;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    reply.status(res.status);
    for (const [key, value] of res.headers.entries()) {
      reply.header(key, value);
    }

    const body = await res.text();
    reply.send(body);
  }
}