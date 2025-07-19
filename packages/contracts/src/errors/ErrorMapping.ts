import { ERROR_CODES, ErrorCode } from './ErrorCodes';

interface ErrorMap {
  pattern: string;
  errorCode: ErrorCode;
  errorType?: string;
}

export const ERROR_MAPPINGS: ErrorMap[] = [
  // SQLite specific errors
  {
    pattern: 'unique',
    errorCode: ERROR_CODES.COMMON.RESOURCE_ALREADY_EXISTS,
    errorType: 'SqliteError',
  },
  {
    pattern: 'foreign key',
    errorCode: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND,
    errorType: 'SqliteError',
  },
  {
    pattern: 'constraint',
    errorCode: ERROR_CODES.COMMON.VALIDATION_CONSTRAINT_VIOLATION,
    errorType: 'SqliteError',
  },

  // Database connection errors
  { pattern: 'database connection', errorCode: ERROR_CODES.COMMON.DATABASE_CONNECTION_FAILED },
  { pattern: 'database locked', errorCode: ERROR_CODES.COMMON.DATABASE_CONNECTION_FAILED },
  { pattern: 'connection refused', errorCode: ERROR_CODES.COMMON.DATABASE_CONNECTION_FAILED },

  // Not found errors
  { pattern: 'not found', errorCode: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND },
  { pattern: 'does not exist', errorCode: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND },
  { pattern: 'no such', errorCode: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND },

  // Validation errors
  { pattern: 'invalid', errorCode: ERROR_CODES.COMMON.VALIDATION_FAILED },
  { pattern: 'required', errorCode: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD },
  { pattern: 'missing', errorCode: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD },
  { pattern: 'empty', errorCode: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD },

  // Authentication/Authorization errors
  { pattern: 'unauthorized', errorCode: ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS },
  { pattern: 'forbidden', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },
  { pattern: 'access denied', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },
  { pattern: 'permission denied', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },

  // Auth service specific
  { pattern: 'invalid credentials', errorCode: ERROR_CODES.AUTH.INVALID_CREDENTIALS },
  { pattern: 'token expired', errorCode: ERROR_CODES.AUTH.TOKEN_EXPIRED },
  { pattern: 'password too weak', errorCode: ERROR_CODES.AUTH.PASSWORD_TOO_WEAK },

  // User service specific
  { pattern: 'file too large', errorCode: ERROR_CODES.USER.FILE_TOO_LARGE },
  { pattern: 'invalid file type', errorCode: ERROR_CODES.USER.INVALID_FILE_TYPE },
  { pattern: 'avatar upload failed', errorCode: ERROR_CODES.USER.AVATAR_UPLOAD_FAILED },

  // Score service specific
  { pattern: 'invalid score', errorCode: ERROR_CODES.SCORE.INVALID_SCORE_VALUE },
  { pattern: 'duplicate score', errorCode: ERROR_CODES.SCORE.DUPLICATE_SCORE_ENTRY },
];

/**
 * Add a new error mapping at runtime (useful for testing or dynamic mappings)
 */
export function addErrorMapping(pattern: string, errorCode: ErrorCode, errorType?: string): void {
  ERROR_MAPPINGS.unshift({ pattern, errorCode, errorType });
}

/**
 * Remove an error mapping
 */
export function removeErrorMapping(pattern: string, errorType?: string): void {
  const index = ERROR_MAPPINGS.findIndex((m) => m.pattern === pattern && m.errorType === errorType);
  if (index !== -1) {
    ERROR_MAPPINGS.splice(index, 1);
  }
}

/**
 * Get all current error mappings (for debugging)
 */
export function getErrorMappings(): typeof ERROR_MAPPINGS {
  return [...ERROR_MAPPINGS];
}
