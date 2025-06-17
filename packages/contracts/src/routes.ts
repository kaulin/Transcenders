export const SERVICE_URLS = {
  USER:
    (typeof process !== 'undefined' ? process.env.USER_SERVICE_URL : undefined) ??
    'http://localhost:3001',
  AUTH:
    (typeof process !== 'undefined' ? process.env.AUTH_SERVICE_URL : undefined) ??
    'http://localhost:3002',
  SCORE:
    (typeof process !== 'undefined' ? process.env.SCORE_SERVICE_URL : undefined) ??
    'http://localhost:3003',
};

export const USER_ROUTES = {
  // GET /users - List users (with optional query params: ?search=, ?limit=, ?offset=)
  // POST /users - Create new user
  USERS: '/users',

  // GET /users/:id - Get specific user by ID
  // PATCH /users/:id - Update user by ID
  // DELETE /users/:id - Delete user by ID
  USER_BY_ID: '/users/:id',

  // GET /users/:identifier/exists - Check if username/email exists
  USER_EXISTS: '/users/:identifier/exists',

  // GET /users/match - find user by name or email (query params: ?username=, ?email=)
  USERS_EXACT: '/users/exact',
} as const;

/**
 * FRIENDSHIP ROUTES - RESTful friendship and friend request management
 */
export const FRIENDSHIP_ROUTES = {
  // GET /users/:id/friendships - Get all friends for a user
  USER_FRIENDSHIPS: '/users/:id/friendships',

  // DELETE /users/:id/friendships/:friendId - Remove a friendship
  FRIENDSHIP: '/users/:id/friendships/:friendId',

  // GET /users/:id/friend-requests - Get incoming friend requests for a user
  USER_FRIEND_REQUESTS: '/users/:id/friend-requests',

  // POST /users/:id/friend-requests - Send friend request to specific user
  SEND_FRIEND_REQUEST: '/users/:id/friend-requests/:recipientId',

  // PUT /users/:id/friend-requests/:requestId - Accept a friend request
  // DELETE /users/:id/friend-requests/:requestId - Decline/cancel a friend request
  FRIEND_REQUEST: '/users/:id/friend-requests/:requestId',

  // GET /friendships/:id1/:id2 - Check if friendship exists between two users
  FRIENDSHIP_EXISTS: '/friendships/:id1/:id2',
} as const;

export const AUTH_ROUTES = {
  // GET /auth - auth inital idk #TODO fix and add more
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
} as const;

export const SCORE_ROUTES = {
  // GET /scores - List scores (with optional query params: ?search=, ?limit=, ?offset=)
  SCORES: '/score/',
  // POST /score - Create a new score entry after a game
  SCORE: '/score/',
  // GET /score/:id - Get a users game history and statistics
  SCORES_BY_ID: '/score/:id',
} as const;
