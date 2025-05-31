import Fastify from 'fastify';
import 'dotenv/config';
import { testDatabase } from './db.js';

const app = Fastify({ logger: true });

const start = async () => {
  // Basic health check route
  app.get('/health', async () => {
    return { status: 'ok', service: 'auth-service' };
  });
  app.get('/db', async () => {
    const result = await testDatabase();
    return result;
  });

  try {
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
