import { ApiClient } from '@transcenders/api-client';
import {
  BooleanOperationResult,
  BooleanResultHelper,
  CreateUserRequest,
  ERROR_CODES,
  GetUsersQuery,
  ResultHelper,
  ServiceError,
  ServiceResult,
  UpdateUserRequest,
  User,
} from '@transcenders/contracts';
import { DatabaseManager, QueryBuilder } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';
import { AvatarService } from './AvatarService.js';

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
        INSERT INTO users (username, display_name, lang, avatar)
        VALUES (${userData.username}, ${
          userData.display_name ?? userData.username
        }, ${userData.lang ?? 'en'}, ${AvatarService.getDefaultAvatarURL()})
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

    const { sql, values } = QueryBuilder.update('users', updates, 'id = ?', [id]);
    const result = await database.run(sql, values);
    // user does not exist
    if ((result.changes ?? 0) === 0) {
      return null;
    }

    return await this.getUserByIdLogic(database, id);
  }

  // Public API methods using ResultHelper
  static async createUser(userData: CreateUserRequest): Promise<ServiceResult<User>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<User>('create user', db, async (database) => {
      return await this.createUserLogic(database, userData);
    });
  }

  static async getUserById(id: number): Promise<ServiceResult<User>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<User>('get user', db, async (database) => {
      const user = await this.getUserByIdLogic(database, id);
      if (!user) {
        throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_ID, { userId: id });
      }
      return user;
    });
  }

  static async getUserByUsername(username: string): Promise<ServiceResult<User>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<User>('get user by username', db, async (database) => {
      const sql = SQL`
        SELECT * FROM users WHERE username = ${username}
      `;
      const user = await database.get(sql.text, sql.values);
      if (!user) {
        throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_USERNAME, { username });
      }
      return user;
    });
  }

  static async getAllUsers(query: GetUsersQuery): Promise<ServiceResult<User[]>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<User[]>('get all users', db, async (database) => {
      const sql = SQL`SELECT * FROM users`;
      if (query.search) {
        const searchTerm = `%${query.search}%`;
        sql.append(SQL` WHERE username LIKE ${searchTerm} OR display_name LIKE ${searchTerm}`);
      }

      sql.append(SQL` ORDER BY created_at DESC`);
      const result = await database.all(sql.text, sql.values);
      return result as User[];
    });
  }

  static async checkUserExists(identifier: string): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'check user exists',
      db,
      async (database) => {
        const sql = SQL`
        SELECT 1 FROM users WHERE username = ${identifier} LIMIT 1
      `;
        const user = await database.get(sql.text, sql.values);
        const exists = !!user;
        if (exists) {
          return BooleanResultHelper.success(`Identifier '${identifier}' exists in the database`);
        }
        return BooleanResultHelper.failure(`No user found with username '${identifier}'`);
      },
    );
  }

  static async updateUser(
    id: number,
    updates: Partial<UpdateUserRequest>,
  ): Promise<ServiceResult<User>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeQuery<User>('update user', db, async (database) => {
      const user = await this.updateUserLogic(database, id, updates);
      if (!user) {
        throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_ID, { userId: id });
      }
      return user;
    });
  }

  static async deleteUser(userId: number): Promise<ServiceResult<BooleanOperationResult>> {
    const db = await DatabaseManager.for('USER').open();
    return ResultHelper.executeTransaction<BooleanOperationResult>(
      'delete user',
      db,
      async (database) => {
        // First check if user exists
        const userExists = await this.getUserByIdLogic(database, userId);
        if (!userExists) {
          throw new ServiceError(ERROR_CODES.USER.NOT_FOUND_BY_ID, { userId });
        }

        // Delete user from auth, Success or not, dont care, clean later
        try {
          const credentialsDeleted = await ApiClient.auth.privateDelete(userId);
        } catch {}

        const sql = SQL`
        DELETE FROM users WHERE id = ${userId}
      `;
        const result = await database.run(sql.text, sql.values);
        const deleted = (result.changes ?? 0) > 0;

        if (deleted) {
          return BooleanResultHelper.success(
            `User with id ${userId} has been successfully deleted`,
          );
        }
        return BooleanResultHelper.failure(`No changes were made to user ${userId}`);
      },
    );
  }
}
