import { FastifyReply } from 'fastify';

export class ResponseHelper {
  static success(reply: FastifyReply, data: any, statusCode = 200) {
    reply.code(statusCode);
    return { success: true, data };
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
