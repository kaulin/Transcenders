import { ERROR_CODES, ErrorCode } from './ErrorCodes.js';

interface ErrorMap {
  pattern: string;
  errorCode: ErrorCode;
}

interface SqliteConstraintMapping {
  constraintType: string;
  errorCode: ErrorCode;
  fieldSpecific?: Record<string, ErrorCode>;
}

const ERROR_MAPPINGS: ErrorMap[] = [
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

  // specific typebox stuff
  {
    pattern: 'must not have',
    errorCode: ERROR_CODES.COMMON.VALIDATION_FAILED,
  },
  {
    pattern: 'must match pattern',
    errorCode: ERROR_CODES.COMMON.VALIDATION_FAILED,
  },

  // Authentication/Authorization errors
  { pattern: 'unauthorized', errorCode: ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS },
  { pattern: 'forbidden', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },
  { pattern: 'access denied', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },
  { pattern: 'permission denied', errorCode: ERROR_CODES.COMMON.FORBIDDEN_ACCESS },

  // Auth service specific
  { pattern: 'invalid credentials', errorCode: ERROR_CODES.AUTH.INVALID_CREDENTIALS },
  { pattern: 'token expired', errorCode: ERROR_CODES.COMMON.AUTH_TOKEN_INVALID },
  { pattern: 'invalid token', errorCode: ERROR_CODES.COMMON.AUTH_TOKEN_INVALID },
  { pattern: 'password too weak', errorCode: ERROR_CODES.AUTH.PASSWORD_TOO_WEAK },

  // User service specific
  { pattern: 'file too large', errorCode: ERROR_CODES.USER.FILE_TOO_LARGE },
  { pattern: 'invalid file type', errorCode: ERROR_CODES.USER.INVALID_FILE_TYPE },
  { pattern: 'avatar upload failed', errorCode: ERROR_CODES.USER.AVATAR_UPLOAD_FAILED },

  // Score service specific
  { pattern: 'invalid score', errorCode: ERROR_CODES.SCORE.INVALID_SCORE_VALUE },
  { pattern: 'duplicate score', errorCode: ERROR_CODES.SCORE.DUPLICATE_SCORE_ENTRY },
];

const SQLITE_CONSTRAINT_MAPPINGS: SqliteConstraintMapping[] = [
  {
    constraintType: 'UNIQUE',
    errorCode: ERROR_CODES.COMMON.RESOURCE_ALREADY_EXISTS,
    fieldSpecific: {
      'users.username': ERROR_CODES.USER.USERNAME_ALREADY_EXISTS,
      friend_requests: ERROR_CODES.USER.FRIEND_REQUEST_ALREADY_EXISTS,
      friendships: ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS,
      scores: ERROR_CODES.SCORE.DUPLICATE_SCORE_ENTRY,
    },
  },
  {
    constraintType: 'FOREIGN KEY',
    errorCode: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND,
    fieldSpecific: {
      users: ERROR_CODES.USER.NOT_FOUND_BY_ID,
      scores: ERROR_CODES.SCORE.SCORE_NOT_FOUND,
      matches: ERROR_CODES.SCORE.MATCH_NOT_FOUND,
    },
  },
  {
    constraintType: 'CHECK',
    errorCode: ERROR_CODES.COMMON.VALIDATION_CONSTRAINT_VIOLATION,
    fieldSpecific: {
      score: ERROR_CODES.SCORE.INVALID_SCORE_VALUE,
    },
  },
  {
    constraintType: 'NOT NULL',
    errorCode: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD,
  },
];

const SQLITE_CONSTRAINT_PATTERNS = [
  // Pattern: UNIQUE constraint failed: table.column
  {
    regex: /(\w+(?:\s+\w+)*)\s+constraint\s+failed:\s*(.+)/i,
    constraintIndex: 1,
    fieldIndex: 2,
  },
  // Pattern: FOREIGN KEY constraint failed
  {
    regex: /(FOREIGN\s+KEY)\s+constraint\s+failed/i,
    constraintIndex: 1,
    fieldIndex: null, // No specific field info
  },
  // Pattern: NOT NULL constraint failed: table.column
  {
    regex: /(NOT\s+NULL)\s+constraint\s+failed:\s*(.+)/i,
    constraintIndex: 1,
    fieldIndex: 2,
  },
];

function mapSqliteError(error: Error, fallback: ErrorCode): ErrorCode {
  const message = error.message;

  // Try each pattern until we find a match
  for (const pattern of SQLITE_CONSTRAINT_PATTERNS) {
    const match = message.match(pattern.regex);

    if (match) {
      const constraintType = match[pattern.constraintIndex]?.toUpperCase().trim();
      const failedField = pattern.fieldIndex ? match[pattern.fieldIndex]?.trim() : null;

      console.log(`SQLite constraint violation detected:`, {
        constraintType,
        failedField,
        originalMessage: message,
      });

      // Find the mapping for this constraint type
      const mapping = SQLITE_CONSTRAINT_MAPPINGS.find((m) => m.constraintType === constraintType);

      if (mapping) {
        // Check for field-specific error code first
        if (failedField && mapping.fieldSpecific) {
          // Try exact match first
          if (mapping.fieldSpecific[failedField]) {
            return mapping.fieldSpecific[failedField];
          }

          // Try partial matches (e.g., "users.email" matches "users")
          for (const [fieldPattern, errorCode] of Object.entries(mapping.fieldSpecific)) {
            if (failedField.includes(fieldPattern) || fieldPattern.includes(failedField)) {
              return errorCode;
            }
          }
        }

        // Use the default error code for this constraint type
        return mapping.errorCode;
      }
    }
  }

  // If no pattern matched, check for generic constraint indicators
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('constraint')) {
    return ERROR_CODES.COMMON.VALIDATION_CONSTRAINT_VIOLATION;
  }

  return fallback;
}

/**
 * Map common exceptions to appropriate error codes using configurable mappings
 */
export function mapExceptionToErrorCode(error: unknown, fallbackCode: ErrorCode): ErrorCode {
  if (!(error instanceof Error)) {
    return fallbackCode;
  }

  const message = error.message.toLowerCase();
  if (message.includes('sqlite_constraint')) {
    return mapSqliteError(error, fallbackCode);
  }

  for (const mapping of ERROR_MAPPINGS) {
    if (message.includes(mapping.pattern)) {
      return mapping.errorCode;
    }
  }

  return fallbackCode;
}

/**
 * Add a new error mapping at runtime (useful for testing or dynamic mappings)
 */
export function addErrorMapping(pattern: string, errorCode: ErrorCode, errorType?: string): void {
  ERROR_MAPPINGS.unshift({ pattern, errorCode });
}

/**
 * Remove an error mapping
 */
export function removeErrorMapping(pattern: string, errorType?: string): void {
  const index = ERROR_MAPPINGS.findIndex((m) => m.pattern === pattern);
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
