import { FastifyError } from 'fastify';
import { ErrorDefinition, getErrorDefinition } from './ErrorCatalog';
import { ERROR_CODES, ErrorCode } from './ErrorCodes';

/**
 * Structured error class for consistent error handling across services
 */
export class ServiceError extends Error {
  public readonly codeOrError: ErrorCode | FastifyError;
  public readonly httpStatus: number;
  public readonly userMessage?: string;
  public readonly category: ErrorDefinition['category'];
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    codeOrError: ErrorCode | FastifyError,
    context?: Record<string, unknown>,
    originalError?: Error,
  ) {
    // FastifyError case
    if (typeof codeOrError === 'object') {
      const errorDef = getErrorDefinition(ERROR_CODES.COMMON.FASTIFY_ERROR);
      super(codeOrError.message);
      this.codeOrError = errorDef?.code;
      this.httpStatus = codeOrError.statusCode ?? 500;
      this.category = 'fastify';
      this.userMessage = codeOrError.message ?? 'fastify';

      this.context = {
        fastifyCode: codeOrError.code,
        validation: codeOrError.validation,
        validationContext: codeOrError.validationContext,
      };
      this.timestamp = new Date();
      this.name = 'ServiceError';

      this.stack = codeOrError.stack;
      this.cause = codeOrError;
    }
    // ErrorCode case
    else {
      const errorDef = getErrorDefinition(codeOrError);
      super(errorDef.message);
      this.codeOrError = errorDef.code;
      this.httpStatus = errorDef.httpStatus;
      this.category = errorDef.category;
      this.userMessage = errorDef.userMessage;

      this.context = context;
      this.timestamp = new Date();
      this.name = 'ServiceError';

      // Preserve original error stack if provided
      if (originalError) {
        this.stack = originalError.stack;
        this.cause = originalError;
      }
    }
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ServiceError.prototype);
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): {
    codeOrError: string | FastifyError;
    message: string;
    userMessage?: string;
    category: string;
    httpStatus: number;
    context?: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      codeOrError: this.codeOrError,
      message: this.message,
      userMessage: this.userMessage,
      category: this.category,
      httpStatus: this.httpStatus,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Create a ServiceError from an unknown error
   */
  static fromUnknownError(
    error: unknown,
    fallbackCode: ErrorCode,
    context?: Record<string, unknown>,
  ): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    if (error instanceof Error) {
      return new ServiceError(
        fallbackCode,
        {
          ...context,
          originalMessage: error.message,
          originalName: error.name,
        },
        error,
      );
    }

    return new ServiceError(fallbackCode, {
      ...context,
      originalError: String(error),
    });
  }

  /**
   * Check if an error is a ServiceError
   */
  static isServiceError(error: unknown): error is ServiceError {
    return error instanceof ServiceError;
  }

  /**
   * Get user-safe error message
   */
  getUserMessage(): string {
    return this.userMessage ?? 'An error occurred';
  }

  /**
   * Get technical error message
   */
  getTechnicalMessage(): string {
    return this.message;
  }

  /**
   * Check if error is of a specific category
   */
  isCategory(category: ErrorDefinition['category']): boolean {
    return this.category === category;
  }

  /**
   * Check if error should be logged as critical
   */
  isCritical(): boolean {
    return this.category === 'internal' && this.httpStatus >= 500;
  }

  /**
   * Get logging context
   */
  getLoggingContext(): Record<string, unknown> {
    return {
      errorCode: this.codeOrError,
      category: this.category,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}
