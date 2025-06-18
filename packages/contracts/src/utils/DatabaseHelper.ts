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
   * Create a successful DatabaseResult
   */
  static success<T>(data: T, operation?: string): DatabaseResult<T> {
    return {
      success: true,
      data,
      operation: operation ?? 'operation',
    };
  }

  /**
   * Create an error DatabaseResult
   */
  static error<T = any>(
    message: string,
    operation?: string,
    code?: string,
    isConstraintError?: boolean,
  ): DatabaseResult<T> {
    return {
      success: false,
      operation: operation ?? 'operation',
      error: {
        code: code ?? 'UNKNOWN_ERROR',
        message,
        isConstraintError: isConstraintError ?? false,
      },
    };
  }

  /**
   * Create an error DatabaseResult from a caught error
   */
  static errorFromException<T = any>(
    error: any,
    operation?: string,
    customMessage?: string,
  ): DatabaseResult<T> {
    const message = customMessage ?? error.message ?? 'Unknown database error';
    const code = error.code ?? 'UNKNOWN_ERROR';
    const isConstraintError = error.code === 'SQLITE_CONSTRAINT';

    return {
      success: false,
      operation: operation ?? 'operation',
      error: {
        code,
        message,
        isConstraintError,
      },
    };
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
      return this.success(data, operation);
    } catch (error: any) {
      console.log(`failed to ${operation}:`, error.message);
      return this.errorFromException(error, operation);
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
        return this.success(data, operation);
      } catch (error: any) {
        await database.run('ROLLBACK');
        console.log(`transaction failed for ${operation}:`, error.message);
        return this.errorFromException(error, operation);
      }
    } catch (error: any) {
      console.log(`failed to ${operation}:`, error.message);
      return this.errorFromException(error, operation);
    }
  }
}
