import Fastify from 'fastify';
import 'dotenv/config';
import { registerAdminRoutes } from './routes/admin.routes.js';

const app = Fastify({ logger: true });

const start = async () => {
  try {
    await registerAdminRoutes(app);

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
