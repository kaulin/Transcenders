export { createFastifyServer, startServer } from './factory/server.factory.js';
export { registerDevelopmentHooks } from './hooks/development.hooks.js';
export { registerCors } from './plugins/cors.plugin.js';
export { setupGracefulShutdown } from './plugins/shutdown-plugin.js';
export { registerSwagger } from './plugins/swagger.plugin.js';
export type { ServerConfig, SwaggerConfig } from './types/server.config.js';
