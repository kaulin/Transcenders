import { getDB } from '../db/database.js';
import { DatabaseTestResponse } from '../types/database.types.js';
import { UserService } from './user.service.js';

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
      const testExistsResult = await UserService.checkUserExists('testuser4242');
      const testUserResult = await UserService.getUserByUsername('testuser4242');
      console.log('Test user exists:', testExistsResult.success ? testExistsResult.data : false);
      console.log('Test user object:', testUserResult.success ? testUserResult.data : null);

      // Test 5: Test user operations
      console.log('Test 5: Testing user creation...');
      const testCreateResult = await UserService.createUser({
        username: 'itsme',
        email: 'amario@mario.fi',
      });
      if (!testCreateResult.success) {
        throw new Error('Test 5 failed');
      }
      console.log('Test user creation:', testCreateResult.data?.display_name);

      // Test 6: Get all users
      console.log('Test 6: Retrieving users...');
      const usersResult = await UserService.getAllUsers({});
      const usersData = usersResult.success ? usersResult.data : [];
      console.log(`Found ${usersData!.length} users in database`);

      // Test 7: cleanup test
      console.log('Test 7: cleanup using deleteUser');
      if (testCreateResult.data?.id) {
        const cleanup1 = await UserService.deleteUser(testCreateResult.data.id);
      }
      if (testUserResult.success && testUserResult.data?.id) {
        const cleanup2 = await UserService.deleteUser(testUserResult.data.id);
      }
      const afterCleanupResult = await UserService.getAllUsers({});
      const afterCleanupData = afterCleanupResult.success ? afterCleanupResult.data : [];
      if (usersData!.length - afterCleanupData!.length != 2) {
        throw new Error('cleanup test failed');
      }
      return {
        message: 'All database tests passed successfully',
        timestamp: new Date().toISOString(),
        tables,
        users: usersData!.slice(0, 5),
      };
    } catch (error) {
      console.error('❌ DatabaseTestService: Tests failed:', error);
      throw error;
    }
  }
}
