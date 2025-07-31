import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { ENV } from '@transcenders/server-utils';
import Fastify, { FastifyInstance } from 'fastify';
import { registerDevelopmentHooks } from '../hooks/development.hooks.js';
import { registerErrorHandler } from '../hooks/error.hook.js';
import { registerCors } from '../plugins/cors.plugin.js';
import { setupGracefulShutdown } from '../plugins/shutdown-plugin.js';
import { registerSwagger } from '../plugins/swagger.plugin.js';
import { ServerConfig, SwaggerConfig } from '../types/server.config.js';

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
