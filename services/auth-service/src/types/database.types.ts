import { User } from './user.types';

/**
 * Database configuration options
 */
export interface DatabaseConfig {
  filename: string;
  fileDir: string;
  verbose?: boolean;
  mode?: 'readonly' | 'readwrite' | 'create';
}

/**
 * Database initialization result
 */
export interface DatabaseInitResult {
  success: boolean;
  databasePath: string;
  tablesCreated: string[];
  indexesCreated: string[];
  triggersCreated: string[];
}

/**
 * Database connection status
 */
export interface DatabaseStatus {
  connected: boolean;
  databasePath: string;
  tablesCount: number;
  lastConnection?: string;
}

/**
 * Database test response
 */
export interface DatabaseTestResponse {
  message: string;
  timestamp: string;
  tables: Array<{ name: string }>;
  users: User[];
}
