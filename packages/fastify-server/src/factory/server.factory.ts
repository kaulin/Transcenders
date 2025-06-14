import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import { registerDevelopmentHooks } from '../hooks/development.hooks';
import { registerCors } from '../plugins/cors.plugin';
import { registerSwagger } from '../plugins/swagger.plugin';
import { ServerConfig, SwaggerConfig } from '../types/server.config';

export async function createFastifyServer(
  config: ServerConfig,
  swaggerConfig?: SwaggerConfig,
): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    ajv: {
      customOptions: {
        removeAdditional: true,
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins in order
  await registerCors(fastify);
  registerDevelopmentHooks(fastify);
  await registerSwagger(fastify, config, swaggerConfig);

  return fastify;
}

export async function startServer(fastify: FastifyInstance, config: ServerConfig): Promise<void> {
  try {
    await fastify.listen({
      port: config.port ?? 3000,
      host: config.host ?? '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
