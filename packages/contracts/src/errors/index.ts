// Core error system exports
export * from './ApiErrorHandler';
export * from './ErrorCatalog';
export * from './ErrorCodes';
export * from './ServiceError';
export * from './ServiceResult';

// Re-export for backward compatibility with existing code
export { DB_ERROR_CODES } from '../errors';
