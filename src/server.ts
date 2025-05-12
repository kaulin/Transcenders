import Fastify from 'fastify';
import 'dotenv/config';
import { registerPingRoutes } from './routes/ping.routes.js'; //includes have to be wiht .js for prod to work, dev setup will still use the .ts correctly

// start fastify
const app = Fastify({ logger: true });

const start = async () => {
  //register my testing routes from ./routes/ping.routes.ts
  registerPingRoutes(app);
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
