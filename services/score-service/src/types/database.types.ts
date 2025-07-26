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
