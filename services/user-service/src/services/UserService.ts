import { getDB } from '../db/database';
import { CreateUserRequest, GetUsersQuery, UpdateUserRequest, User } from '@transcenders/contracts';

/**
 * Endpoints
 * GET /api/users - get all users (with pagination)
 * POST /api/users - create new user
 * GET /api/users/:id - get specific user by ID
 * PATCH /api/users/:id - update user
 * DELETE /api/users/:id - delete user
 * GET /api/users/check/:identifier - check if username/email exists
 */

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User | null> {
    try {
      const database = await getDB();

      const result = await database.run(
        'INSERT INTO users (username, email, display_name) VALUES (?, ?, ?)',
        [userData.username, userData.email, userData.display_name || userData.username],
      );
      if (!result.lastID) {
        return null;
      }
      const user = await this.getUserById(result.lastID);
      return user as User;
    } catch (error) {
      console.log('failed to create user', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const database = await getDB();
      const user = await database.get('SELECT * FROM users WHERE username = ?', [username]);
      return user ? (user as User) : null;
    } catch (error: any) {
      console.log('failed to get user', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const database = await getDB();
      const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
      return user ? (user as User) : null;
    } catch (error: any) {
      console.log('failed to get user', error);
      throw error;
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const database = await getDB();
      const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
      return user ? (user as User) : null;
    } catch (error: any) {
      console.log('failed to get user', error);
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

  static async updateUser(id: number, updates: Partial<UpdateUserRequest>): Promise<User | null> {
    try {
      const database = await getDB();

      // build dynamic sql based on provided keys in the interface
      const fields = Object.keys(updates);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setFields = fields.map((field) => `${field} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id.toString());

      const sql = `UPDATE users SET ${setFields} WHERE id = ?`;

      const result = await database.run(sql, values);
      if ((result.changes || 0) === 0) {
        return null;
      }
      return await this.getUserById(id);
    } catch (error) {
      console.log('failed to update user', error);
      throw error;
    }
  }

  static async deleteUser(userId: number): Promise<boolean> {
    try {
      const database = await getDB();

      const result = await database.run('DELETE FROM users WHERE id = ?', [userId]);

      return (result.changes || 0) > 0;
    } catch (error) {
      console.log('failed to delete user', error);
      throw error;
    }
  }
}
