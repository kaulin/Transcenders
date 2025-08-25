import { FastifyError, FastifyReply } from 'fastify';
import { ApiResponseType } from '../user.schemas.js';
import { getErrorDefinition } from './ErrorCatalog.js';
import { ERROR_CODES, ErrorCode } from './ErrorCodes.js';
import { mapExceptionToErrorCode } from './ErrorMapping.js';
import { ServiceError } from './ServiceError.js';
import { ServiceResult } from './ServiceResult.js';

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
   * Convert Fastify Error to Api response
   */
  static errorFromFastify(
    reply: FastifyReply,
    error: FastifyError,
    operation: string,
  ): ApiResponseType {
    let myServiceError: ServiceError;
    if (!(error instanceof ServiceError)) {
      const mappedErrorCode = mapExceptionToErrorCode(error, ERROR_CODES.COMMON.FASTIFY_ERROR);
      myServiceError = new ServiceError(mappedErrorCode, { message: String(error) });
    } else {
      myServiceError = error;
    }
    reply.code(myServiceError.httpStatus ?? 500);
    return {
      success: false,
      operation,
      error: myServiceError.toJSON(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error API response using error code
   */
  static error(
    reply: FastifyReply,
    codeOrError: ErrorCode | FastifyError,
    operation: string,
    context?: Record<string, unknown>,
  ): ApiResponseType {
    if (typeof codeOrError !== 'string') {
      return this.errorFromFastify(reply, codeOrError, operation);
    }
    const errorDef = getErrorDefinition(codeOrError);

    if (!errorDef) {
      // Fallback for unknown error codes
      reply.code(500);
      return {
        success: false,
        operation,
        error: new ServiceError(ERROR_CODES.COMMON.UNKNOWN_ERROR, context).toJSON(),
        timestamp: new Date().toISOString(),
      };
    }

    reply.code(errorDef.httpStatus);
    return {
      success: false,
      operation,
      error: new ServiceError(errorDef.code, context).toJSON(),
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
    return this.error(reply, serviceError.codeOrError, operation, serviceError.context);
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
}
