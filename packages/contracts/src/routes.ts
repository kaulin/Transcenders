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

export const FRIENDSHIP_ROUTES = {
  USER_FRIENDS: '/users/:id/friends',
  REMOVE_FRIEND: '/friend/remove',
  SEND_REQUEST: '/friend/request',
  INCOMING_REQUESTS: '/friend/requests/:id',
  FRIEND_ACCEPT: '/friend/accept/:id',
  FRIEND_DECLINE: '/friend/decline/:id',
  FRIEND_EXISTS: '/friend/exists/:id1/:id2',
} as const;
