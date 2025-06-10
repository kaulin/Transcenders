import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

export async function registerCors(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    credentials: true,
  });
}
