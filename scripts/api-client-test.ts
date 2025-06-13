import { ApiClient } from '@transcenders/api-client';
import { CreateUserRequest, User, USER_ROUTES } from '@transcenders/contracts';

const API_BASE = 'http://localhost:3001';

async function testDirectCall() {
  const response = await ApiClient.call(`${API_BASE}${USER_ROUTES.USERS}`);
  console.log('direct call:', response.success ? 'ok' : response.error);
}

async function testUserService() {
  const response = await ApiClient.user.getUsers();

  console.log(
    'user service:',
    response.success ? `got ${(response.data as User[]).length ?? 0} users` : response.error,
  );
}

async function testCrud() {
  const testUser: CreateUserRequest = {
    username: 'test_user_123',
    email: 'test@example.com',
    display_name: 'Test User',
  };

  // create
  const created = await ApiClient.user.createUser(testUser);
  if (!created.success) {
    console.log('create failed:', created.error);
    return;
  }
  const userId = (created.data as User).id;
  console.log('created user:', userId);

  // update
  const updated = await ApiClient.user.updateUser(userId, { display_name: 'Updated User' });
  console.log('update:', updated.success ? 'ok' : updated.error);

  // cleanup
  await ApiClient.user.deleteUser(userId);
}

async function main() {
  await testDirectCall();
  await testUserService();
  await testCrud();
}

main();
