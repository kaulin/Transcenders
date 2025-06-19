import { FastifyRequest } from 'fastify';

export class GatewayService {
  static async forward(
    targetServiceUrl: string,
    request: FastifyRequest,
    path: string
  ) {
    const targetUrl = `${targetServiceUrl}${path}`;
    const method = request.method;
    const headers = { ...request.headers } as Record<string, string>;

    const body = method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(request.body);

    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await res.text();
    const contentType = res.headers.get('content-type');

    return {
      status: res.status,
      body: data,
      contentType,
    };
  }
}