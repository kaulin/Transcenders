import { FastifyError } from 'fastify';
import { Database } from 'sqlite';
import { ERROR_CODES, ErrorCode, mapExceptionToErrorCode } from '../errors/index.js';
import { ServiceError } from '../errors/ServiceError.js';
import { ServiceResult } from '../errors/ServiceResult.js';

/**
 * Helper class for creating and managing ServiceResult objects
 * Replaces DatabaseHelper with better naming and enhanced error handling
 */
export class ResultHelper {
  /**
   * Create a successful ServiceResult
   */
  static success<T>(data: T, operation: string): ServiceResult<T> {
    return {
      success: true,
      data,
      operation,
      timestamp: new Date(),
    };
  }

  /**
   * Create an error ServiceResult
   */
  static error<T>(
    errorCode: ErrorCode | FastifyError,
    operation: string,
    context?: Record<string, unknown>,
  ): ServiceResult<T> {
    const error = new ServiceError(errorCode, context);

    return {
      success: false,
      error,
      operation,
      timestamp: new Date(),
    };
  }

  static isFastifyError(error: unknown): error is FastifyError {
    return (
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      error.code.startsWith('FST_ERR_')
    );
  }

  /**
   * Create an error ServiceResult from a caught exception
   */
  static errorFromException<T>(
    error: unknown,
    operation: string,
    fallbackErrorCode: ErrorCode = ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR,
    context?: Record<string, unknown>,
  ): ServiceResult<T> {
    // If it's already a ServiceError, preserve it
    if (error instanceof ServiceError) {
      return {
        success: false,
        error,
        operation,
        timestamp: new Date(),
      };
    }

    if (this.isFastifyError(error)) {
      return {
        success: false,
        error: new ServiceError(error),
        operation,
        timestamp: new Date(),
      };
    }

    // Map common exceptions to appropriate error codes
    const errorCode = mapExceptionToErrorCode(error, fallbackErrorCode);
    const serviceError = ServiceError.fromUnknownError(error, errorCode, context);

    return {
      success: false,
      error: serviceError,
      operation,
      timestamp: new Date(),
    };
  }

  /**
   * Execute a single operation with automatic error handling
   */
  static async executeOperation<T>(
    operation: string,
    operationFn: () => Promise<T>,
  ): Promise<ServiceResult<T>> {
    try {
      const data = await operationFn();
      return this.success(data, operation);
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);
      return this.errorFromException(error, operation);
    }
  }

  /**
   * Execute a database transaction with automatic rollback on error
   */
  static async executeTransaction<T>(
    operation: string,
    database: Database,
    transactionFn: (database: Database) => Promise<T>,
  ): Promise<ServiceResult<T>> {
    try {
      await database.run('BEGIN TRANSACTION');

      try {
        const data = await transactionFn(database);
        await database.run('COMMIT');
        return this.success(data, operation);
      } catch (error: unknown) {
        await database.run('ROLLBACK');
        console.error(`Transaction failed for ${operation}:`, error);
        return this.errorFromException(error, operation, ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, {
          transactionRolledBack: true,
        });
      }
    } catch (error: unknown) {
      console.error(`Failed to start transaction for ${operation}:`, error);
      return this.errorFromException(error, operation);
    }
  }

  /**
   * Execute a database query with automatic error handling
   */
  static async executeQuery<T>(
    operation: string,
    database: Database,
    queryFn: (database: Database) => Promise<T>,
  ): Promise<ServiceResult<T>> {
    try {
      const data = await queryFn(database);
      return this.success(data, operation);
    } catch (error: unknown) {
      console.error(`Query failed for ${operation}:`, error);
      return this.errorFromException(error, operation);
    }
  }

  /**
   * Combine multiple ServiceResults into a single result
   * Returns success only if all results are successful
   */
  static combineResults<T>(results: ServiceResult<T>[], operation: string): ServiceResult<T[]> {
    const errors: ServiceError[] = [];
    const data: T[] = [];

    for (const result of results) {
      if (result.success) {
        data.push(result.data);
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      // Return the first error, but include context about multiple errors
      const firstError = errors[0];
      if (!firstError) {
        throw new Error('Expected at least one error but found none');
      }
      const context = {
        totalErrors: errors.length,
        allErrorCodes: errors.map((e) => e.codeOrError),
      };

      return this.error(firstError.codeOrError, operation, context);
    }

    return this.success(data, operation);
  }

  /**
   * Convert a ServiceResult to a Promise that resolves with data or rejects with error
   */
  static toPromise<T>(result: ServiceResult<T>): Promise<T> {
    if (result.success) {
      return Promise.resolve(result.data);
    }
    return Promise.reject(result.error);
  }

  /**
   * Convert a Promise to a ServiceResult
   */
  static async fromPromise<T>(promise: Promise<T>, operation: string): Promise<ServiceResult<T>> {
    try {
      const data = await promise;
      return this.success(data, operation);
    } catch (error: unknown) {
      return this.errorFromException(error, operation);
    }
  }
}
