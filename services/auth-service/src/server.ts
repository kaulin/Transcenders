import Fastify from 'fastify';
import 'dotenv/config';
import { registerAdminRoutes } from './routes/admin.routes.js';
import { registerUserRoutes } from './routes/user.routes.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

const start = async () => {
  try {
    await registerAdminRoutes(app);
    await registerUserRoutes(app);

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
