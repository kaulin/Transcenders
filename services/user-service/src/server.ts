import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import 'dotenv/config';
import Fastify from 'fastify';
import { registerAdminRoutes } from './routes/admin.routes.js';
import { registerFriendshipRoutes } from './routes/friend.routes.js';
import { registerUserRoutes } from './routes/user.routes.js';

const app = Fastify({
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
  app.addHook('onSend', async (request, reply, payload) => {
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
    await registerAdminRoutes(app);
    await registerUserRoutes(app);
    await registerFriendshipRoutes(app);

    await app.listen({
      port: process.env.PORT ? +process.env.PORT : 3000,
      host: '0.0.0.0',
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
