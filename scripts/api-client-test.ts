import { ApiClient } from '@transcenders/api-client';
import { CreateUserRequest } from '@transcenders/contracts';

async function testDirectCall() {
  try {
    const response = await ApiClient.call('http://localhost:3001/users');
    console.log('direct call:', response.success ? 'ok' : response.error.message);
  } catch (error) {
    console.log('direct call failed:', error.message);
  }
}

async function testUserService() {
  try {
    const users = await ApiClient.user.getUsers();
    console.log(`user service: got ${users.length} users`);
  } catch (error) {
    console.log('user service failed:', error.message);
  }
}

async function testAuthService() {
  try {
    // Test registration
    const newUser = await ApiClient.auth.register({
      username: 'test_auth_user',
      password: 'testpass123',
    });
    console.log('auth register: ok, user id:', newUser.id);

    // Test login
    const authData = await ApiClient.auth.login({
      username: 'test_auth_user',
      password: 'testpass123',
    });
    console.log('auth login: ok, got tokens');

    // Test logout
    await ApiClient.auth.logout(newUser.id, authData.refreshToken);
    console.log('auth logout: ok');

    // Cleanup
    await ApiClient.auth.privateDelete(newUser.id);
    await ApiClient.user.deleteUser(newUser.id);
    console.log('cleanup: ok');
  } catch (error) {
    console.log('auth service failed:', error.message);
  }
}

async function testCrud() {
  try {
    const testUser: CreateUserRequest = {
      username: 'test_user_123',
      email: 'test@example.com',
      display_name: 'Test User',
    };

    // Create - returns User object directly
    const createdUser = await ApiClient.user.createUser(testUser);
    console.log('created user:', createdUser.id);

    // Update - returns updated User object
    const updatedUser = await ApiClient.user.updateUser(createdUser.id, {
      display_name: 'Updated User',
    });
    console.log('update: ok, new name:', updatedUser.display_name);

    // Get specific user
    const fetchedUser = await ApiClient.user.getUserById(createdUser.id);
    console.log('fetch: ok, username:', fetchedUser.username);

    // Cleanup - returns boolean operation result
    const deleteResult = await ApiClient.user.deleteUser(createdUser.id);
    console.log('cleanup:', deleteResult.success ? 'ok' : 'failed');
  } catch (error) {
    console.log('crud test failed:', error.message);
    if (error.category) {
      console.log('error category:', error.category);
    }
  }
}

async function main() {
  console.log('=== Testing Strongly Typed API Client ===\n');

  await testDirectCall();
  console.log('');

  await testUserService();
  console.log('');

  await testAuthService();
  console.log('');

  await testCrud();
  console.log('');
}

main().catch(console.error);
