import { ApiResponse, DatabaseResult } from '@transcenders/contracts';
import { FastifyReply } from 'fastify';

export class ResponseHelper {
  static success(reply: FastifyReply, operation: string, data: any, statusCode = 200): ApiResponse {
    reply.code(statusCode);
    return { success: true, operation, data };
  }

  static error(
    reply: FastifyReply,
    operation: string,
    statusCode: number,
    message: string,
  ): ApiResponse {
    reply.code(statusCode);
    return { success: false, operation, error: message };
  }

  /**
   * Handle DatabaseResult objects automatically
   * Treats constraint errors as success with original message
   */
  static handleDatabaseResult<T>(
    reply: FastifyReply,
    result: DatabaseResult<T>,
    successStatusCode = 200,
    errorStatusCode = 500,
  ): ApiResponse {
    if (!result.success) {
      return this.error(
        reply,
        result.operation,
        errorStatusCode,
        result.error?.message || 'Operation failed',
      );
    }

    return this.success(reply, result.operation, result.data, successStatusCode);
  }

  static throwError(message: string, statusCode = 500) {
    const error = new Error(message) as any;
    error.statusCode = statusCode;
    throw error;
  }

  static throwNotFound(message = 'Resource not found') {
    this.throwError(message, 404);
  }

  static throwBadRequest(message: string) {
    this.throwError(message, 400);
  }
}
