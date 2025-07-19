import { FastifyReply } from 'fastify';
import { ApiResponseType } from '../user.schemas';
import { getErrorDefinition } from './ErrorCatalog';
import { ERROR_CODES, ErrorCode } from './ErrorCodes';
import { ServiceError } from './ServiceError';
import { ServiceResult } from './ServiceResult';

/**
 * ApiErrorHandler replaces ResponseHelper with enhanced error handling
 * Provides consistent HTTP status code mapping and structured error responses
 */
export class ApiErrorHandler {
  /**
   * Create a successful API response
   */
  static success<T>(
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

  /**
   * Create an error API response using error code
   */
  static error(
    reply: FastifyReply,
    errorCode: ErrorCode,
    operation: string,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    const errorDef = getErrorDefinition(errorCode);

    if (!errorDef) {
      // Fallback for unknown error codes
      reply.code(500);
      return {
        success: false,
        operation,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          userMessage: 'Something went wrong. Please try again later.',
          category: 'internal',
          context,
        },
        timestamp: new Date().toISOString(),
      };
    }

    reply.code(errorDef.httpStatus);
    return {
      success: false,
      operation,
      error: {
        code: errorDef.code,
        message: errorDef.message,
        userMessage: errorDef.userMessage,
        category: errorDef.category,
        context,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error response from a ServiceError instance
   */
  static errorFromServiceError(
    reply: FastifyReply,
    serviceError: ServiceError,
    operation: string,
  ): ApiResponseType {
    return this.error(reply, serviceError.code, operation, serviceError.context);
  }

  /**
   * Handle ServiceResult objects automatically with proper HTTP status mapping
   */
  static handleServiceResult<T>(
    reply: FastifyReply,
    result: ServiceResult<T>,
    successStatusCode = 200,
  ): ApiResponseType {
    if (!result.success && result.error) {
      return this.errorFromServiceError(reply, result.error, result.operation);
    }

    if (result.success && result.data !== undefined) {
      return this.success(reply, result.operation, result.data, successStatusCode);
    }

    // Fallback for malformed results
    return this.error(reply, ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, result.operation, {
      malformedResult: true,
    });
  }

  /**
   * Handle validation errors with multiple error details
   */
  static validationError(
    reply: FastifyReply,
    operation: string,
    validationErrors: {
      field: string;
      message: string;
      value?: unknown;
    }[],
  ): ApiResponseType {
    return this.error(reply, ERROR_CODES.COMMON.VALIDATION_FAILED, operation, {
      validationErrors,
    });
  }

  /**
   * Handle authentication errors with proper 401 status
   */
  static authenticationError(
    reply: FastifyReply,
    operation: string,
    errorCode: ErrorCode = ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    return this.error(reply, errorCode, operation, context);
  }

  /**
   * Handle authorization errors with proper 403 status
   */
  static authorizationError(
    reply: FastifyReply,
    operation: string,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    return this.error(reply, ERROR_CODES.COMMON.FORBIDDEN_ACCESS, operation, context);
  }

  /**
   * Handle not found errors with proper 404 status
   */
  static notFoundError(
    reply: FastifyReply,
    operation: string,
    resourceType?: string,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    return this.error(reply, ERROR_CODES.COMMON.RESOURCE_NOT_FOUND, operation, {
      ...context,
      resourceType,
    });
  }

  /**
   * Handle conflict errors with proper 409 status
   */
  static conflictError(
    reply: FastifyReply,
    operation: string,
    errorCode: ErrorCode = ERROR_CODES.COMMON.RESOURCE_ALREADY_EXISTS,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    return this.error(reply, errorCode, operation, context);
  }

  /**
   * Handle internal server errors with proper 500 status
   */
  static internalError(
    reply: FastifyReply,
    operation: string,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    return this.error(reply, ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, operation, context);
  }

  /**
   * Get HTTP status code for an error code
   */
  static getHttpStatusForErrorCode(errorCode: ErrorCode): number {
    const errorDef = getErrorDefinition(errorCode);
    return errorDef?.httpStatus ?? 500;
  }

  /**
   * Check if an error code represents a client error (4xx)
   */
  static isClientError(errorCode: ErrorCode): boolean {
    const status = this.getHttpStatusForErrorCode(errorCode);
    return status >= 400 && status < 500;
  }

  /**
   * Check if an error code represents a server error (5xx)
   */
  static isServerError(errorCode: ErrorCode): boolean {
    const status = this.getHttpStatusForErrorCode(errorCode);
    return status >= 500;
  }
}
