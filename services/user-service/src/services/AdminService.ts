import {
  BooleanOperationResult,
  BooleanResultHelper,
  DatabaseHelper,
  DatabaseResult,
  UserConfig,
} from '@transcenders/contracts';
import SQL from 'sql-template-strings';
import { getDB } from '../db/database';

export class AdminService {
  static async updateUserActivity(id: number): Promise<DatabaseResult<BooleanOperationResult>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<BooleanOperationResult>(
      'update user activity',
      db,
      async (database) => {
        const sql = SQL`
            UPDATE users 
            SET last_activity = CURRENT_TIMESTAMP, status = 'online'
            WHERE id = ${id}
          `;

        const result = await database.run(sql.text, sql.values);
        if (result.changes === 0) {
          return BooleanResultHelper.failure(`User with ID ${id} not found`);
        }
        return BooleanResultHelper.success(`User with ID ${id} activity updated`);
      },
    );
  }

  static async cleanupOfflineUsers(
    timeoutMinutes?: number,
  ): Promise<DatabaseResult<BooleanOperationResult>> {
    const db = await getDB();
    const timeout = timeoutMinutes ?? UserConfig.OFFLINE_TIMEOUT_MINUTES;
    return DatabaseHelper.executeQuery<BooleanOperationResult>(
      'cleanup offline users',
      db,
      async (database) => {
        const timeoutString = `-${timeout} minutes`;
        const sql = SQL`
          UPDATE users
          SET status = 'offline'
          WHERE status = 'online'
          AND last_activity < datetime('now', ${timeoutString})
        `;
        const result = await database.run(sql.text, sql.values);
        return BooleanResultHelper.success(
          `set ${result.changes ?? 0} users offline (timeout: ${timeout}min)`,
        );
      },
    );
  }
}
