import { ResponseHelper } from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AdminService } from '../services/AdminService';
import { HealthResponse } from '../types/api.types';

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
   * #TODO get the token parsed userId after Gateway is ready
   */
  static async updateUserActivity(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number };
    const result = await AdminService.updateUserActivity(id);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
