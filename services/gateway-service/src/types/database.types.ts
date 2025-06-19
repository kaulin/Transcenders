import { User } from '@transcenders/contracts';

/**
 * Database configuration options
 */
export interface DatabaseConfig {
  filename: string;
  fileDir: string;
  verbose?: boolean;
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
 * Database test response
 */
export interface DatabaseTestResponse {
  message: string;
  timestamp: string;
  tables: Array<{ name: string }>;
  users: User[];
}
