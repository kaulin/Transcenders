import { ERROR_CODES, ErrorCode } from './ErrorCodes';

/**
 * Error definition interface
 */
export interface ErrorDefinition {
  code: ErrorCode;
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

const commonErrors: Record<Extract<ErrorCode, `COMMON_${string}`>, ErrorDefinition> = {
  [ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD]: {
    code: ERROR_CODES.COMMON.VALIDATION_REQUIRED_FIELD,
    message: 'Required field is missing or empty',
    userMessage: 'Please fill in all required fields',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.COMMON.VALIDATION_CONSTRAINT_VIOLATION]: {
    code: ERROR_CODES.COMMON.VALIDATION_CONSTRAINT_VIOLATION,
    message: 'Data constraint violation occurred',
    userMessage: 'The provided data violates system constraints',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.COMMON.VALIDATION_FAILED]: {
    code: ERROR_CODES.COMMON.VALIDATION_FAILED,
    message: 'Validation failed for one or more fields',
    userMessage: 'Please check your input and try again',
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

  [ERROR_CODES.COMMON.RESOURCE_ALREADY_EXISTS]: {
    code: ERROR_CODES.COMMON.RESOURCE_ALREADY_EXISTS,
    message: 'Resource already exists',
    userMessage: 'This item already exists',
    httpStatus: 409,
    category: 'conflict',
  },

  [ERROR_CODES.COMMON.DATABASE_CONNECTION_FAILED]: {
    code: ERROR_CODES.COMMON.DATABASE_CONNECTION_FAILED,
    message: 'Database connection failed',
    userMessage: 'Unable to connect to the database. Please try again later.',
    httpStatus: 500,
    category: 'internal',
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

  [ERROR_CODES.COMMON.FORBIDDEN_ACCESS]: {
    code: ERROR_CODES.COMMON.FORBIDDEN_ACCESS,
    message: 'Access forbidden - insufficient permissions',
    userMessage: 'You do not have permission to access this resource',
    httpStatus: 403,
    category: 'authorization',
  },
};

const authErrors: Record<Extract<ErrorCode, `AUTH_${string}`>, ErrorDefinition> = {
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

  [ERROR_CODES.AUTH.PASSWORD_TOO_WEAK]: {
    code: ERROR_CODES.AUTH.PASSWORD_TOO_WEAK,
    message: 'Password does not meet security requirements',
    userMessage: 'Password is too weak. Please use a stronger password.',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.AUTH.REGISTRATION_FAILED]: {
    code: ERROR_CODES.AUTH.REGISTRATION_FAILED,
    message: 'User registration process failed',
    userMessage: 'Registration failed. Please try again.',
    httpStatus: 500,
    category: 'internal',
  },
};

const userErrors: Record<Extract<ErrorCode, `USER_${string}`>, ErrorDefinition> = {
  [ERROR_CODES.USER.USERNAME_ALREADY_EXISTS]: {
    code: ERROR_CODES.USER.USERNAME_ALREADY_EXISTS,
    message: 'User with this username already exists',
    userMessage: 'Username is already taken',
    httpStatus: 409,
    category: 'conflict',
  },
  [ERROR_CODES.USER.EMAIL_ALREADY_EXISTS]: {
    code: ERROR_CODES.USER.EMAIL_ALREADY_EXISTS,
    message: 'User with this email already exists',
    userMessage: 'Email is already taken',
    httpStatus: 409,
    category: 'conflict',
  },

  [ERROR_CODES.USER.NOT_FOUND_BY_ID]: {
    code: ERROR_CODES.USER.NOT_FOUND_BY_ID,
    message: 'User not found with the provided ID',
    userMessage: 'User not found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.USER.NOT_FOUND_BY_USERNAME]: {
    code: ERROR_CODES.USER.NOT_FOUND_BY_USERNAME,
    message: 'User not found with the provided username',
    userMessage: 'User not found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.USER.NOT_FOUND_BY_EMAIL]: {
    code: ERROR_CODES.USER.NOT_FOUND_BY_EMAIL,
    message: 'User not found with the provided email address',
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

  [ERROR_CODES.USER.INVALID_FILE_TYPE]: {
    code: ERROR_CODES.USER.INVALID_FILE_TYPE,
    message: 'File type is not supported for upload',
    userMessage: 'Invalid file type. Please upload a supported image format.',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.USER.FILE_TOO_LARGE]: {
    code: ERROR_CODES.USER.FILE_TOO_LARGE,
    message: 'File size exceeds maximum allowed limit',
    userMessage: 'File is too large. Please upload a smaller file.',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.USER.FILE_NOT_PROVIDED]: {
    code: ERROR_CODES.USER.FILE_NOT_PROVIDED,
    message: 'No file was provided in the request',
    userMessage: 'Please select a file to upload',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS]: {
    code: ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS,
    message: 'Friendship between these users already exists',
    userMessage: 'You are already friends with this user',
    httpStatus: 409,
    category: 'conflict',
  },

  [ERROR_CODES.USER.FRIENDSHIP_NOT_FOUND]: {
    code: ERROR_CODES.USER.FRIENDSHIP_NOT_FOUND,
    message: 'Friendship not found between these users',
    userMessage: 'You are not friends with this user',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND]: {
    code: ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND,
    message: 'Friend request not found or already processed',
    userMessage: 'Friend request not found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.USER.FRIEND_REQUEST_ALREADY_EXISTS]: {
    code: ERROR_CODES.USER.FRIEND_REQUEST_ALREADY_EXISTS,
    message: 'Friend request already exists between these users',
    userMessage: 'Friend request already sent',
    httpStatus: 409,
    category: 'conflict',
  },

  [ERROR_CODES.USER.CANNOT_BEFRIEND_SELF]: {
    code: ERROR_CODES.USER.CANNOT_BEFRIEND_SELF,
    message: 'Users cannot send friend requests to themselves',
    userMessage: 'You cannot send a friend request to yourself',
    httpStatus: 400,
    category: 'validation',
  },
};

const scoreErrors: Record<Extract<ErrorCode, `SCORE_${string}`>, ErrorDefinition> = {
  [ERROR_CODES.SCORE.SCORE_CREATION_FAILED]: {
    code: ERROR_CODES.SCORE.SCORE_CREATION_FAILED,
    message: 'Failed to create score record - database insert did not return an ID',
    userMessage: 'Unable to save the game score.',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.SCORE.INVALID_SCORE_VALUE]: {
    code: ERROR_CODES.SCORE.INVALID_SCORE_VALUE,
    message: 'Score value is invalid or out of range',
    userMessage: 'Invalid score value',
    httpStatus: 400,
    category: 'validation',
  },

  [ERROR_CODES.SCORE.MATCH_NOT_FOUND]: {
    code: ERROR_CODES.SCORE.MATCH_NOT_FOUND,
    message: 'Match not found with the provided identifier',
    userMessage: 'Match not found',
    httpStatus: 404,
    category: 'not_found',
  },

  [ERROR_CODES.SCORE.DUPLICATE_SCORE_ENTRY]: {
    code: ERROR_CODES.SCORE.DUPLICATE_SCORE_ENTRY,
    message: 'Score entry already exists for this match',
    userMessage: 'Score has already been recorded for this match',
    httpStatus: 409,
    category: 'conflict',
  },

  [ERROR_CODES.SCORE.STATS_CALCULATION_FAILED]: {
    code: ERROR_CODES.SCORE.STATS_CALCULATION_FAILED,
    message: 'Statistics calculation process failed',
    userMessage: 'Unable to calculate statistics. Please try again.',
    httpStatus: 500,
    category: 'internal',
  },
};

export const ERROR_CATALOG: Record<ErrorCode, ErrorDefinition> = {
  ...commonErrors,
  ...authErrors,
  ...userErrors,
  ...scoreErrors,
};

/**
 * Helper functions for error catalog
 */

// Get error definition by code
export function getErrorDefinition(code: ErrorCode): ErrorDefinition | undefined {
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
