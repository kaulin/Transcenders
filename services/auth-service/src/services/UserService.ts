import { getDB } from '../db/database';
import { CreateUserRequest, GetUsersQuery, RemoveUserRequest, User } from '../types/user.types';

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const database = await getDB();

      const result = await database.run(
        'INSERT INTO users (username, email, display_name) VALUES (?, ?, ?)',
        [userData.username, userData.email, userData.display_name || userData.username],
      );
      if (!result.lastID) {
        throw new Error('Failed to create user');
      }
      const user = await database.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      return user as User;
    } catch (error) {
      console.log('failed to create user', error);
      throw error;
    }
  }

  static async getAllUsers(query: GetUsersQuery): Promise<User[]> {
    try {
      const database = await getDB();

      const params: string[] = [];
      let sql = 'SELECT * FROM users';
      if (query.search) {
        params.push(query.search, query.search, query.search);
        const searchCondition = ' WHERE username LIKE ? OR email LIKE ? OR display_name LIKE ?';
        sql += searchCondition;
      }

      sql += ' ORDER BY created_at DESC';
      return (await database.all(sql, params)) as User[];
    } catch (error) {
      console.log('failed to get all users', error);
      throw error;
    }
  }

  static async checkUserExists(identifier: string): Promise<boolean> {
    try {
      const database = await getDB();

      const user = await database.get(
        'SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1',
        [identifier, identifier],
      );

      return !!user;
    } catch (error) {
      console.log('failed to check user', error);
      throw error;
    }
  }

  static async deleteUser(userData: RemoveUserRequest): Promise<boolean> {
    try {
      const database = await getDB();

      const result = await database.run('DELETE FROM users WHERE username = ? AND email = ?', [
        userData.username,
        userData.email,
      ]);

      return (result.changes || 0) > 0;
    } catch (error) {
      console.log('failed to delete user', error);
      throw error;
    }
  }
}
