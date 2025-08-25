import {
  ADMIN_ROUTES,
  cleanupOfflineUsersSchema,
  standardApiResponses,
  userActivitySchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/AdminController.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/admin/health', { preHandler: app.authenticate.none() }, AdminController.getHealth);
  app.post(
    ADMIN_ROUTES.ACTIVITY,
    {
      preHandler: app.authenticate.internal(),
      schema: {
        description: 'Update user activity',
        tags: ['Admin'],
        params: userActivitySchema.params,
        response: standardApiResponses,
      },
    },
    AdminController.updateUserActivity,
  );

  app.post(
    ADMIN_ROUTES.CLEANUP_OFFLINE,
    {
      preHandler: app.authenticate.internal(),
      schema: {
        description: 'Set offline/idle users offline',
        tags: ['Admin'],
        querystring: cleanupOfflineUsersSchema.querystring,
        response: standardApiResponses,
      },
    },
    AdminController.cleanupOfflineUsers,
  );

  app.get('/admin/ip', { preHandler: app.authenticate.required() }, (req, reply) => {
    reply.send({
      ip: req.ip,
      ips: req.ips,
      rawRemote: req.socket.remoteAddress,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'true-client-ip': req.headers['true-client-ip'],
        forwarded: req.headers.forwarded,
        via: req.headers.via,
        'user-agent': req.headers['user-agent'],
      },
    });
  });
}
