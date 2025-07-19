/**
 * Hierarchical error codes for all services
 * Format: SERVICE_CATEGORY_SPECIFIC
 * Start minimal - add more codes as needed during implementation
 */
export const ERROR_CODES = {
  // Common errors across services
  COMMON: {
    VALIDATION_REQUIRED_FIELD: 'COMMON_VALIDATION_REQUIRED_FIELD',
    RESOURCE_NOT_FOUND: 'COMMON_RESOURCE_NOT_FOUND',
    INTERNAL_SERVER_ERROR: 'COMMON_INTERNAL_SERVER_ERROR',
    UNAUTHORIZED_ACCESS: 'COMMON_UNAUTHORIZED_ACCESS',
  },

  // Auth service specific errors
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    USER_ALREADY_EXISTS: 'AUTH_USER_ALREADY_EXISTS',
  },

  // User service specific errors
  USER: {
    NOT_FOUND_BY_ID: 'USER_NOT_FOUND_BY_ID',
    AVATAR_UPLOAD_FAILED: 'USER_AVATAR_UPLOAD_FAILED',
    FRIENDSHIP_ALREADY_EXISTS: 'USER_FRIENDSHIP_ALREADY_EXISTS',
  },

  // Score service specific errors
  SCORE: {
    MATCH_CREATION_FAILED: 'SCORE_MATCH_CREATION_FAILED',
    INVALID_SCORE_VALUE: 'SCORE_INVALID_SCORE_VALUE',
  },
} as const;

// Type for all possible error codes
export type ErrorCode =
  (typeof ERROR_CODES)[keyof typeof ERROR_CODES][keyof (typeof ERROR_CODES)[keyof typeof ERROR_CODES]];

// Helper function to get all error codes as an array
export function getAllErrorCodes(): string[] {
  const codes: string[] = [];

  Object.values(ERROR_CODES).forEach((serviceErrors) => {
    Object.values(serviceErrors).forEach((code) => {
      codes.push(code);
    });
  });

  return codes;
}

// Helper function to validate if a code exists
export function isValidErrorCode(code: string): boolean {
  return getAllErrorCodes().includes(code);
}
