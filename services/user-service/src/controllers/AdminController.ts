import { CleanupOfflineQuery } from '@transcenders/contracts';
import { ApiErrorHandler } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AdminService } from '../services/AdminService.js';
import { HealthResponse } from '../types/api.types.js';

export class AdminController {
  /**
   * Health check controller
   */
  static async getHealth(request: FastifyRequest, reply: FastifyReply): Promise<HealthResponse> {
    return {
      success: true,
      data: {
        service: 'user-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Update user activity (called by gateway after auth)
   */
  static async updateUserActivity(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number };
    const result = await AdminService.updateUserActivity(id);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  /**
   * set users offline who have been away for a time specified in config or with ?timeoutMinutes=
   */
  static async cleanupOfflineUsers(request: FastifyRequest, reply: FastifyReply) {
    const querystring = request.query as CleanupOfflineQuery;
    const result = await AdminService.cleanupOfflineUsers(querystring.timeoutMinutes);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
