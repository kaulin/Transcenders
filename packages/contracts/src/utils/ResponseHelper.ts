import { ApiResponseType, DatabaseResult } from '@transcenders/contracts';
import { FastifyReply } from 'fastify';

export class ResponseHelper {
  static success<T = unknown>(
    reply: FastifyReply,
    operation: string,
    data: T,
    statusCode = 200,
  ): ApiResponseType {
    reply.code(statusCode);
    return {
      success: true,
      operation,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    reply: FastifyReply,
    operation: string,
    statusCode: number,
    message: string,
  ): ApiResponseType {
    reply.code(statusCode);
    return {
      success: false,
      operation,
      error: {
        code: 'LEGACY_ERROR',
        message,
        category: 'internal',
      },
      timestamp: new Date().toISOString(),
    };
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
  ): ApiResponseType {
    if (!result.success) {
      return this.error(
        reply,
        result.operation,
        errorStatusCode,
        result.error?.message ?? 'Operation failed',
      );
    }

    return this.success(reply, result.operation, result.data, successStatusCode);
  }
}
