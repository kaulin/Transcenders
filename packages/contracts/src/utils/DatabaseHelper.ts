import { DatabaseResult } from '@transcenders/contracts';
import fs from 'fs';
import { Database } from 'sqlite';

export class DatabaseHelper {
  static getSqlFromFile(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
      console.log(`SQL file not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  }

  /**
   * execute a single database operation
   */
  static async executeQuery<T>(
    operation: string,
    database: Database,
    queryFn: (database: Database) => Promise<T>,
  ): Promise<DatabaseResult<T>> {
    try {
      const data = await queryFn(database);
      return { success: true, data, operation };
      //#TODO fix all implicit error:any stuff
    } catch (error: any) {
      console.log(`failed to ${operation}:`, error.message);

      return {
        success: false,
        operation,
        error: {
          code: error.code ?? 'UNKNOWN_ERROR',
          message: error.message ?? 'Unknown database error',
          isConstraintError: error.code === 'SQLITE_CONSTRAINT',
        },
      };
    }
  }
  /**
   * Execute multiple database operations in a transaction
   */
  static async executeTransaction<T>(
    operation: string,
    database: Database,
    transactionFn: (database: Database) => Promise<T>,
  ): Promise<DatabaseResult<T>> {
    try {
      await database.run('BEGIN TRANSACTION');

      try {
        const data = await transactionFn(database);
        await database.run('COMMIT');
        return { success: true, data, operation };
      } catch (error: any) {
        await database.run('ROLLBACK');
        console.log(`transaction failed for ${operation}:`, error.message);

        return {
          success: false,
          operation,
          error: {
            code: error.code ?? 'UNKNOWN_ERROR',
            message: error.message ?? 'Unknown database error',
            isConstraintError: error.code === 'SQLITE_CONSTRAINT',
          },
        };
      }
    } catch (error: any) {
      console.log(`failed to ${operation}:`, error.message);

      return {
        success: false,
        operation,
        error: {
          code: error.code ?? 'UNKNOWN_ERROR',
          message: error.message ?? 'Unknown database error',
          isConstraintError: error.code === 'SQLITE_CONSTRAINT',
        },
      };
    }
  }
}
