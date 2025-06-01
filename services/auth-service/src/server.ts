import Fastify from 'fastify';
import 'dotenv/config';
import { DatabaseTestService } from './services/DatabaseTestService.js';
import { DatabaseTestResponse } from './types/database.types.js';

const app = Fastify({ logger: true });

const start = async () => {
  // Basic health check route
  app.get('/health', async () => {
    return { status: 'ok', service: 'auth-service' };
  });
  app.get('/db', async () => {
    const result: DatabaseTestResponse = await DatabaseTestService.runTests();
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
