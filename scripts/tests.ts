import { CreateUserRequest, FRIENDSHIP_ROUTES, User } from '@transcenders/contracts';
import 'dotenv/config';
import { ApiClient } from '../packages/api-client/src/api/ApiClient';

const API_BASE = 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Simple HTTP client for non-auth operations
async function apiCall<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: data ? { 'Content-Type': 'application/json' } : {},
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API call failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

const SAMPLE_USERS: (CreateUserRequest & { password: string })[] = [
  {
    username: 'alice',
    password: '123',
  },
  {
    username: 'bob',
    password: '123',
  },
  {
    username: 'charlie',
    password: '123',
  },
  {
    username: 'diana',
    password: '123',
  },
  {
    username: 'eve',
    display_name: 'Eve Adams',
    password: '123',
  },
  {
    username: 'frank',
    password: '123',
  },
  {
    username: 'grace',
    password: '123',
  },
  {
    username: 'henry',
    password: '123',
  },
];

async function createUsers(): Promise<User[]> {
  console.log('Creating users through auth service...');
  const users: User[] = [];

  for (const userData of SAMPLE_USERS) {
    try {
      const user = await ApiClient.auth.register({
        username: userData.username,
        password: userData.password,
      });
      users.push(user);
      console.log(`Created user: ${userData.username} (ID: ${user.id})`);
    } catch (error) {
      try {
        const existingUser = await ApiClient.user.getUserExact({ username: userData.username });
        users.push(existingUser);
      } catch (error) {
        console.log(`Error creating user ${userData.username}:`, error);
      }
    }
  }

  return users;
}

async function createFriendships(users: User[]): Promise<void> {
  console.log('\nCreating friendships...');

  // Define friendship pairs by array index
  const friendshipPairs = [
    [0, 1], // alice <-> bob
    [0, 2], // alice <-> charlie
    [1, 3], // bob <-> diana
    [2, 4], // charlie <-> eve
    [3, 5], // diana <-> frank
    [0, 6], // alice <-> grace
  ];

  for (const [idx1, idx2] of friendshipPairs) {
    if (!users[idx1]) continue;

    const user1 = users[idx1];
    const user2 = users[idx2];

    try {
      // Send friend request
      const requestPath = FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST.replace(
        `:id`,
        `${user1.id}`,
      ).replace(`:recipientId`, `${user2.id}`);

      const requestResponse = await apiCall('POST', requestPath);
      if (!requestResponse.success) {
        console.log(
          `Failed to send friend request: ${user1.username} -> ${user2.username} | error:`,
          requestResponse.error,
        );
      }

      // Get incoming requests to find the request ID
      const incomingRequest = FRIENDSHIP_ROUTES.USER_FRIEND_REQUESTS.replace(':id', `${user2.id}`);
      const incomingResponse = await apiCall<any[]>('GET', incomingRequest);
      if (!incomingResponse.success) {
        console.log(
          `Failed to get incoming requests for ${user2.username} | error:`,
          incomingResponse.error,
        );
        continue;
      }

      // Find the request from user1
      const request = incomingResponse.data.find((req) => req.initiator_id === user1.id);
      if (!request) {
        console.log(`Could not find friend request from ${user1.username} to ${user2.username}`);
        continue;
      }

      // Accept the friend request
      const acceptResponse = await apiCall(
        'PUT',
        FRIENDSHIP_ROUTES.FRIEND_REQUEST.replace(':id', `${user1.id}`).replace(
          ':requestId',
          `${request.id}`,
        ),
      );
      if (acceptResponse.success) {
        console.log(`Created friendship: ${user1.username} <-> ${user2.username}`);
      } else {
        console.log(`Failed to accept friend request: ${user1.username} <-> ${user2.username}`);
      }
    } catch (error) {
      console.log(`Error creating friendship ${user1.username} <-> ${user2.username}:`, error);
    }
  }
}

async function createPendingRequests(users: User[]): Promise<void> {
  console.log('\nCreating pending friend requests...');

  // Define pending requests by array index
  const pendingRequests = [
    [7, 0], // henry -> alice
    [4, 6], // eve -> grace
    [5, 7], // frank -> henry
    [6, 4], // grace -> eve autoaccept
  ];

  for (const [initiatorIdx, recipientIdx] of pendingRequests) {
    if (!users[initiatorIdx]) continue;

    const initiator = users[initiatorIdx];
    const recipient = users[recipientIdx];

    try {
      const requestPath = FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST.replace(
        `:id`,
        `${initiator.id}`,
      ).replace(`:recipientId`, `${recipient.id}`);

      const response = await apiCall('POST', requestPath);
      if (response.success) {
        console.log(`Created pending request: ${initiator.username} -> ${recipient.username}`);
      } else {
        console.log(
          `Failed to create pending request: ${initiator.username} -> ${recipient.username} | error:`,
          response.error,
        );
      }
    } catch (error) {
      console.log(
        `Error creating pending request ${initiator.username} -> ${recipient.username}:`,
        error,
      );
    }
  }
}

async function testEndpoints(users: User[]): Promise<void> {
  console.log('\nTesting endpoints...');

  if (users.length === 0) {
    console.log('No users to test with');
    return;
  }

  try {
    // Use ApiClient for user operations
    const users = await ApiClient.user.getUsers();
    console.log(`Total users in database: ${users.length}`);

    // Test get friends for first user
    const aliceId = users[0].id;
    const friendsResponse = await apiCall<User[]>(
      'GET',
      FRIENDSHIP_ROUTES.USER_FRIENDSHIPS.replace(':id', aliceId.toString()),
    );
    console.log(`Alice has ${friendsResponse.data?.length ?? 0} friends`);

    // Test get incoming requests for first user
    const requestsResponse = await apiCall<any[]>(
      'GET',
      FRIENDSHIP_ROUTES.USER_FRIEND_REQUESTS.replace(':id', aliceId.toString()),
    );
    console.log(`Alice has ${requestsResponse.data?.length ?? 0} incoming friend requests`);
  } catch (error) {
    console.log('Error testing endpoints:', error);
  }
}

async function main() {
  console.log('Starting test data seeding...');
  console.log('API Base:', API_BASE);

  try {
    const users = await createUsers();
    console.log(`${users.length} test users in database`);

    if (users?.length > 0) {
      await createFriendships(users);
      await createPendingRequests(users);
      await testEndpoints(users);
    }

    console.log('\nSeeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
