import { DatabaseResult } from '@transcenders/contracts';
import { FastifyReply } from 'fastify';

export class ResponseHelper {
  static success(reply: FastifyReply, data: any, statusCode = 200) {
    reply.code(statusCode);
    return { success: true, data };
  }

  static error(reply: FastifyReply, statusCode: number, message: string) {
    reply.code(statusCode);
    return { success: false, error: message };
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
  ) {
    if (!result.success) {
      if (result.error?.isConstraintError) {
        console.warn(`Database constraint (non-critical): ${result.error.message}`);
        return this.success(
          reply,
          {
            success: true,
            message: result.error.message,
          },
          successStatusCode,
        );
      }

      return this.error(reply, errorStatusCode, result.error?.message || 'Operation failed');
    }

    return this.success(reply, result.data, successStatusCode);
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
