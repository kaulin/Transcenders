import { FastifyInstance } from 'fastify';

interface PingResponse {
  pong: string;
}

export async function registerPingRoutes(app: FastifyInstance) {
  // test ping route
  app.get<{
    Reply: PingResponse;
  }>('/ping', async () => {
    return { pong: 'testing if it still works' };
  });
}
