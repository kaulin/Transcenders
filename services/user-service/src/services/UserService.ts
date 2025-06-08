import {
  BooleanOperationResult,
  CreateUserRequest,
  DatabaseResult,
  DB_ERROR_CODES,
  GetUsersQuery,
  UpdateUserRequest,
  User,
} from '@transcenders/contracts';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { DatabaseHelper } from '../utils/DatabaseHelper';

export class UserService {
  // Private logic methods for internal use
  private static async getUserByIdLogic(database: Database, id: number): Promise<User | null> {
    const sql = SQL`
      SELECT * FROM users WHERE id = ${id}
    `;
    const user = await database.get(sql.text, sql.values);
    return user ? (user as User) : null;
  }

  private static async createUserLogic(
    database: Database,
    userData: CreateUserRequest,
  ): Promise<User> {
    const sql = SQL`
        INSERT INTO users (username, email, display_name)
        VALUES (${userData.username}, ${userData.email}, ${
      userData.display_name || userData.username
    })
      `;

    const result = await database.run(sql.text, sql.values);
    if (!result.lastID) {
      throw new Error('Failed to create user');
    }

    const user = await this.getUserByIdLogic(database, result.lastID);
    if (!user) {
      throw new Error('User created but not found');
    }

    return user;
  }

  private static async updateUserLogic(
    database: Database,
    id: number,
    updates: Partial<UpdateUserRequest>,
  ): Promise<User | null> {
    // build dynamic sql based on provided keys
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setFields = fields.map((field) => `${field} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id.toString());

    const sql = `UPDATE users SET ${setFields} WHERE id = ?`;

    const result = await database.run(sql, values);
    // user does not exist
    if ((result.changes || 0) === 0) {
      return null;
    }

    return await this.getUserByIdLogic(database, id);
  }

  // Public API methods using DatabaseHelper
  static async createUser(userData: CreateUserRequest): Promise<DatabaseResult<User>> {
    return DatabaseHelper.executeQuery<User>('create user', async (database) => {
      return await this.createUserLogic(database, userData);
    });
  }

  static async getUserById(id: number): Promise<DatabaseResult<User>> {
    return DatabaseHelper.executeQuery<User>('get user', async (database) => {
      const user = await this.getUserByIdLogic(database, id);
      if (!user) {
        const error = new Error(`user id '${id}'not found`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return user;
    });
  }

  static async getUserByUsername(username: string): Promise<DatabaseResult<User>> {
    return DatabaseHelper.executeQuery<User>('get user by username', async (database) => {
      const sql = SQL`
        SELECT * FROM users WHERE username = ${username}
      `;
      const user = await database.get(sql.text, sql.values);
      if (!user) {
        const error = new Error(`user '${username}' not found`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return user;
    });
  }

  static async getUserByEmail(email: string): Promise<DatabaseResult<User | null>> {
    return DatabaseHelper.executeQuery<User | null>('get user by email', async (database) => {
      const sql = SQL`
        SELECT * FROM users WHERE email = ${email}
      `;
      const user = await database.get(sql.text, sql.values);
      if (!user) {
        const error = new Error(`user with email '${email}' not found`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return user;
    });
  }

  static async getAllUsers(query: GetUsersQuery): Promise<DatabaseResult<User[]>> {
    return DatabaseHelper.executeQuery<User[]>('get all users', async (database) => {
      let sql = SQL`SELECT * FROM users`;
      if (query.search) {
        const searchTerm = `%${query.search}%`;
        sql.append(
          SQL` WHERE username LIKE ${searchTerm} OR email LIKE ${searchTerm} OR display_name LIKE ${searchTerm}`,
        );
      }

      sql.append(SQL` ORDER BY created_at DESC`);
      const result = await database.all(sql.text, sql.values);
      return result as User[];
    });
  }

  static async checkUserExists(
    identifier: string,
  ): Promise<DatabaseResult<BooleanOperationResult>> {
    return DatabaseHelper.executeQuery<BooleanOperationResult>(
      'check user exists',
      async (database) => {
        const sql = SQL`
        SELECT 1 FROM users WHERE username = ${identifier} OR email = ${identifier} LIMIT 1
      `;
        const user = await database.get(sql.text, sql.values);
        const exists = !!user;
        if (exists) {
          return {
            success: true,
            message: `User with identifier '${identifier}' exists in the database`,
          };
        } else {
          return {
            success: false,
            message: `No user found with username or email '${identifier}'`,
          };
        }
      },
    );
  }

  static async updateUser(
    id: number,
    updates: Partial<UpdateUserRequest>,
  ): Promise<DatabaseResult<User | null>> {
    return DatabaseHelper.executeQuery<User | null>('update user', async (database) => {
      const user = await this.updateUserLogic(database, id, updates);
      if (!user) {
        const error = new Error(`user with id '${id}' not found`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return user;
    });
  }

  static async deleteUser(userId: number): Promise<DatabaseResult<BooleanOperationResult>> {
    return DatabaseHelper.executeQuery<BooleanOperationResult>('delete user', async (database) => {
      // First check if user exists
      const userExists = await this.getUserByIdLogic(database, userId);

      if (!userExists) {
        return {
          success: false,
          message: `Cannot delete user: no user found with id ${userId}`,
        };
      }

      const sql = SQL`
        DELETE FROM users WHERE id = ${userId}
      `;
      const result = await database.run(sql.text, sql.values);
      const deleted = (result.changes || 0) > 0;

      if (deleted) {
        return {
          success: true,
          message: `User with id ${userId} has been successfully deleted`,
        };
      } else {
        return {
          success: false,
          message: `Delete operation completed but no changes were made to user ${userId}`,
        };
      }
    });
  }
}
