import { ERROR_CODES } from './ErrorCodes';

/**
 * Error definition interface
 */
export interface ErrorDefinition {
  code: string;
  message: string;
  httpStatus: number;
  userMessage?: string; // Optional user-friendly message
  category:
    | 'validation'
    | 'authentication'
    | 'authorization'
    | 'not_found'
    | 'conflict'
    | 'internal';
}

/**
 * Minimal error catalog with HTTP status codes and user messages
 * Start with essential errors - add more as needed during implementation
 */
export const ERROR_CATALOG: Record<string, ErrorDefinition> = {
  // Common errors
  [ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD]: {
    code: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD,
    message: 'Required field is missing or empty',
    userMessage: 'Please fill in all required fields',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.COMMON.RESOURCE_NOT_FOUND]: {
    code: ERROR_CODES.COMMON.RESOURCE_NOT_FOUND,
    message: 'Requested resource not found',
    userMessage: 'The requested item could not be found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR]: {
    code: ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR,
    message: 'An unexpected internal server error occurred',
    userMessage: 'Something went wrong. Please try again later.',
    httpStatus: 500,
    category: 'internal',
  },

  [ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS]: {
    code: ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS,
    message: 'Authentication required to access this resource',
    userMessage: 'Please log in to continue',
    httpStatus: 401,
    category: 'authentication',
  },

  // Auth service errors
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: {
    code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
    message: 'Invalid username or password provided',
    userMessage: 'Invalid login credentials',
    httpStatus: 401,
    category: 'authentication',
  },

  [ERROR_CODES.AUTH.TOKEN_EXPIRED]: {
    code: ERROR_CODES.AUTH.TOKEN_EXPIRED,
    message: 'Authentication token has expired',
    userMessage: 'Your session has expired. Please log in again.',
    httpStatus: 401,
    category: 'authentication',
  },

  [ERROR_CODES.AUTH.USER_ALREADY_EXISTS]: {
    code: ERROR_CODES.AUTH.USER_ALREADY_EXISTS,
    message: 'User with this username or email already exists',
    userMessage: 'Username or email is already taken',
    httpStatus: 409,
    category: 'conflict',
  },

  // User service errors
  [ERROR_CODES.USER.NOT_FOUND_BY_ID]: {
    code: ERROR_CODES.USER.NOT_FOUND_BY_ID,
    message: 'User not found with the provided ID',
    userMessage: 'User not found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.USER.AVATAR_UPLOAD_FAILED]: {
    code: ERROR_CODES.USER.AVATAR_UPLOAD_FAILED,
    message: 'Avatar upload operation failed',
    userMessage: 'Avatar upload failed. Please try again.',
    httpStatus: 500,
    category: 'internal',
  },

  [ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS]: {
    code: ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS,
    message: 'Friendship between these users already exists',
    userMessage: 'You are already friends with this user',
    httpStatus: 409,
    category: 'conflict',
  },

  // Score service errors
  [ERROR_CODES.SCORE.MATCH_CREATION_FAILED]: {
    code: ERROR_CODES.SCORE.MATCH_CREATION_FAILED,
    message: 'Failed to create new match',
    userMessage: 'Match creation failed. Please try again.',
    httpStatus: 500,
    category: 'internal',
  },

  [ERROR_CODES.SCORE.INVALID_SCORE_VALUE]: {
    code: ERROR_CODES.SCORE.INVALID_SCORE_VALUE,
    message: 'Score value is invalid or out of range',
    userMessage: 'Invalid score value',
    httpStatus: 400,
    category: 'validation',
  },
};

/**
 * Helper functions for error catalog
 */

// Get error definition by code
export function getErrorDefinition(code: string): ErrorDefinition | undefined {
  return ERROR_CATALOG[code];
}

// Get all error definitions
export function getAllErrorDefinitions(): ErrorDefinition[] {
  return Object.values(ERROR_CATALOG);
}

// Get error definitions by category
export function getErrorDefinitionsByCategory(
  category: ErrorDefinition['category'],
): ErrorDefinition[] {
  return getAllErrorDefinitions().filter((def) => def.category === category);
}

// Get error definitions by HTTP status
export function getErrorDefinitionsByHttpStatus(httpStatus: number): ErrorDefinition[] {
  return getAllErrorDefinitions().filter((def) => def.httpStatus === httpStatus);
}

// Validate that all error codes have definitions
export function validateErrorCatalogCompleteness(): {
  isComplete: boolean;
  missingCodes: string[];
} {
  const allCodes = Object.values(ERROR_CODES).flatMap((serviceErrors) =>
    Object.values(serviceErrors),
  );
  const catalogCodes = Object.keys(ERROR_CATALOG);

  const missingCodes = allCodes.filter((code) => !catalogCodes.includes(code));

  return {
    isComplete: missingCodes.length === 0,
    missingCodes,
  };
}
