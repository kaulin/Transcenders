import { FastifyReply, FastifyRequest } from 'fastify';
import { HealthResponse } from '../types/api.types';
import { DatabaseTestService } from '../services/databaseTest.service';

export class AdminController {
  /**
   * Health check controller
   */
  static async getHealth(request: FastifyRequest, reply: FastifyReply): Promise<HealthResponse> {
    return {
      success: true,
      service: 'user-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Database test controller
   */
  static async testDatabase(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await DatabaseTestService.runTests();
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  }
}