import { getDB } from '../db/database';
import { DatabaseTestResponse } from '../types/database.types';
import { UserService } from './UserService.js';

export class DatabaseTestService {
  public static async runTests(): Promise<DatabaseTestResponse> {
    console.log('DatabaseTestService: Running Tests...');

    try {
      const database = await getDB();

      // Test 1: Insert a test user
      console.log('Test 1: Creating test user...');
      await database.run(
        'INSERT OR IGNORE INTO users (username, email, display_name) VALUES (?, ?, ?)',
        ['testuser4242', 'test4242@example.com', 'Test User'],
      );

      // Test 3: Check tables exist
      console.log('Test 3: Checking database schema...');
      const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
      console.log(
        'Tables in database:',
        tables.map((t) => t.name),
      );

      // Test 4: Test user operations
      console.log('Test 4: Testing user existance...');
      const testExists = await UserService.checkUserExists('testuser4242');
      const testUser = await UserService.getUserByUsername('testuser4242');
      console.log('Test user exists:', testExists);
      console.log('Test user object:', testUser);

      // Test 5: Test user operations
      console.log('Test 5: Testing user creation...');
      const testCreate = await UserService.createUser({
        username: 'itsme',
        email: 'amario@mario.fi',
      });
      if (!testCreate) {
        throw new Error('Test 5 failed');
      }
      console.log('Test user creation:', testCreate.display_name);

      // Test 6: Get all users
      console.log('Test 6: Retrieving users...');
      const usersResult = await UserService.getAllUsers({});
      console.log(`Found ${usersResult.length} users in database`);

      // Test 7: cleanup test
      console.log('Test 7: cleanup using deleteUser');
      if (testCreate?.id) {
        const cleanup1 = await UserService.deleteUser(testCreate.id);
      }
      if (testUser?.id) {
        const cleanup2 = await UserService.deleteUser(testUser.id);
      }
      const afterCleanup = await UserService.getAllUsers({});
      if (usersResult.length - afterCleanup.length != 2) {
        throw new Error('cleanup test failed');
      }
      return {
        message: 'All database tests passed successfully',
        timestamp: new Date().toISOString(),
        tables,
        users: usersResult.slice(0, 5),
      };
    } catch (error) {
      console.error('❌ DatabaseTestService: Tests failed:', error);
      throw error;
    }
  }
}
