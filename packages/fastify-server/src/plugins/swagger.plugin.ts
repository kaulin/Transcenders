import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { ENV } from '@transcenders/server-utils';
import { FastifyInstance } from 'fastify';
import { ServerConfig, SwaggerConfig } from '../types/server.config.js';

export async function registerSwagger(
  fastify: FastifyInstance,
  config: ServerConfig,
  swaggerConfig?: SwaggerConfig,
) {
  // Register Swagger
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: config.title,
        description: config.description,
        version: config.version ?? '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: swaggerConfig?.routePrefix ?? '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: ENV.NODE_ENV !== 'development',
    transformStaticCSP: swaggerConfig?.transformStaticCSP,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}
