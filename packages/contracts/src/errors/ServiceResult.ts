import { ServiceError } from './ServiceError';
/**
 * Internally used ServiceResult interface
 */
export type ServiceResult<T> =
  | {
      success: true;
      timestamp: Date;
      data: T;
      operation: string;
    }
  | {
      success: false;
      timestamp: Date;
      error: ServiceError;
      operation: string;
    };

/**
 * Type guard to check if a result is successful
 */
export function isSuccessResult<T>(
  result: ServiceResult<T>,
): result is ServiceResult<T> & { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

/**
 * Type guard to check if a result is an error
 */
export function isErrorResult<T>(
  result: ServiceResult<T>,
): result is ServiceResult<T> & { success: false; error: ServiceError } {
  return result.success === false && result.error !== undefined;
}

/**
 * Extract data from a successful result or throw the error
 */
export function unwrapResult<T>(result: ServiceResult<T>): T {
  if (isSuccessResult(result)) {
    return result.data;
  }

  if (isErrorResult(result)) {
    throw result.error;
  }

  throw new Error('Invalid ServiceResult state');
}

/**
 * Extract data from a successful result or return a default value
 */
export function unwrapResultOr<T>(result: ServiceResult<T>, defaultValue: T): T {
  if (isSuccessResult(result)) {
    return result.data;
  }

  return defaultValue;
}

/**
 * Map the data of a successful result, or pass through the error
 */
export function mapResult<T, U>(
  result: ServiceResult<T>,
  mapper: (data: T) => U,
): ServiceResult<U> {
  if (isSuccessResult(result)) {
    return {
      success: true,
      data: mapper(result.data),
      operation: result.operation,
      timestamp: result.timestamp,
    };
  }

  return {
    success: false,
    error: result.error,
    operation: result.operation,
    timestamp: result.timestamp,
  };
}

/**
 * Chain multiple service operations together
 */
export function chainResult<T, U>(
  result: ServiceResult<T>,
  next: (data: T) => ServiceResult<U>,
): ServiceResult<U> {
  if (isSuccessResult(result)) {
    return next(result.data);
  }

  return {
    success: false,
    error: result.error,
    operation: result.operation,
    timestamp: result.timestamp,
  };
}
