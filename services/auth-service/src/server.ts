import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import 'dotenv/config';
import Fastify from 'fastify';
import { registerAuthRoutes } from './routes/auth.routes';

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

if (process.env.NODE_ENV === 'development') {
  fastify.addHook('onSend', async (request, reply, payload) => {
    try {
      const parsed = JSON.parse(payload as string);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return payload;
    }
  });
}

const start = async () => {
  try {
    // Register Swagger BEFORE schemas and routes
    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'User Service API',
          description: 'API for user management and friendships',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT ? +process.env.PORT : 3002}`,
            description: 'Development server',
          },
        ],
      },
    });

    // Register Swagger UI
    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      uiHooks: {
        onRequest: function (request, reply, next) {
          next();
        },
        preHandler: function (request, reply, next) {
          next();
        },
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });

    await registerAuthRoutes(fastify);
    await fastify.listen({
      port: process.env.PORT ? +process.env.PORT : 3002,
      host: '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
