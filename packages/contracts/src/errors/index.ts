// Core error system exports
export * from './ErrorCatalog';
export * from './ErrorCodes';
export * from './ServiceError';

// Re-export for backward compatibility with existing code
export { DB_ERROR_CODES } from '../errors';
