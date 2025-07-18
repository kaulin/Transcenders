import {
  BooleanOperationResult,
  BooleanResultHelper,
  DatabaseHelper,
  DatabaseResult,
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
}
