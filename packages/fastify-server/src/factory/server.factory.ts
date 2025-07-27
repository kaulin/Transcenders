import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { ENV } from '@transcenders/server-utils';
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import { registerDevelopmentHooks } from '../hooks/development.hooks';
import { registerErrorHandler } from '../hooks/error.hook';
import { registerCors } from '../plugins/cors.plugin';
import { setupGracefulShutdown } from '../plugins/shutdown-plugin';
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
        ENV.NODE_ENV === 'development'
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

  registerErrorHandler(fastify);
  // Register plugins in order
  await setupGracefulShutdown(fastify, config);
  await registerCors(fastify);
  await registerSwagger(fastify, config, swaggerConfig);
  registerDevelopmentHooks(fastify);

  return fastify;
}

export async function startServer(fastify: FastifyInstance, config: ServerConfig): Promise<void> {
  try {
    await fastify.listen({
      port: config.port,
      host: config.host ?? '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
