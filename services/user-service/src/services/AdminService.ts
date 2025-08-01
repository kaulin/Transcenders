import {
  BooleanOperationResult,
  BooleanResultHelper,
  ResultHelper,
  ServiceResult,
  UserConfig,
} from '@transcenders/contracts';
import { DatabaseManager } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';

export class AdminService {
  static async updateUserActivity(id: number): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<BooleanOperationResult>(
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
  ): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('USER').open();
    const timeout = timeoutMinutes ?? UserConfig.OFFLINE_TIMEOUT_MINUTES;
    return ResultHelper.executeQuery<BooleanOperationResult>(
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
