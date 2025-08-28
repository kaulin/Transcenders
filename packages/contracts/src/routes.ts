import { getEnvVar } from './utils/getEnvVar.js';

export const SERVICE_URLS = {
  USER: getEnvVar('USER_SERVICE_URL', 'http://localhost:3001'),
  AUTH: getEnvVar('AUTH_SERVICE_URL', 'http://localhost:3002'),
  SCORE: getEnvVar('SCORE_SERVICE_URL', 'http://localhost:3003'),
} as const;

export const USER_ROUTES = {
  // GET /users - List users (with optional query params: ?search=, ?limit=, ?offset=)
  // POST /users - Create new user
  USERS: '/users',

  // GET /users/:id - Get specific user by ID
  // PATCH /users/:id - Update user by ID
  // DELETE /users/:id - Delete user by ID
  USER_BY_ID: '/users/:id',

  // GET /users/:identifier/exists - Check if username exists
  USER_EXISTS: '/users/:identifier/exists',

  // GET /users/match - find user by name or (query params: ?username=)
  USERS_EXACT: '/users/exact',
} as const;

export const ADMIN_ROUTES = {
  // POST /admin/users/:id/activity - Create new user
  ACTIVITY: '/admin/users/:id/activity',
  // POST /admin/cleanup/offline - Cleanup offline users (query params: ?timeoutMinutes)
  CLEANUP_OFFLINE: '/admin/cleanup/offline',
} as const;

/**
 * FRIENDSHIP ROUTES - RESTful friendship and friend request management
 */
export const FRIENDSHIP_ROUTES = {
  // GET /users/:id/friendships - Get all friends for a user
  USER_FRIENDSHIPS: '/users/:id/friendships',

  // DELETE /users/:id/friendships/:friendId - Remove a friendship
  REMOVE_FRIENDSHIP: '/users/:id/friendships/:friendId',

  // GET /users/:id/friend-requests/incoming - Get incoming friend requests
  FRIEND_REQUESTS_INCOMING: '/users/:id/friend-requests/incoming',

  // GET /users/:id/friend-requests/outgoing - Get outgoing friend requests
  FRIEND_REQUESTS_OUTGOING: '/users/:id/friend-requests/outgoing',

  // POST /users/:id/friend-requests/:targetUserId - Send friend request to specific user
  SEND_FRIEND_REQUEST: '/users/:id/friend-requests/:targetUserId',

  // PUT /users/:id/friend-requests/:requestingUserId - Accept friend request from specific user
  ACCEPT_FRIEND_REQUEST: '/users/:id/friend-requests/:requestingUserId',

  // DELETE /users/:id/friend-requests/:requestingUserId - Decline friend request from specific user
  DECLINE_FRIEND_REQUEST: '/users/:id/friend-requests/:requestingUserId',

  // GET /users/:id/relationship/:targetUserId - Get relationship status with another user
  RELATIONSHIP_STATUS: '/users/:id/relationship/:targetUserId',
} as const;

export const AUTH_ROUTES = {
  // POST /auth/register, body as RegisterUser
  REGISTER: '/auth/register',
  // POST /auth/refresh, body as RefreshTokenRequest
  REFRESH: '/auth/refresh',
  // POST /auth/login, body as LoginUser
  LOGIN: '/auth/login',
  // POST /auth/logout/, body as LogoutUser
  LOGOUT: '/auth/logout/:id',
  // PATCH /auth/change-password/:id
  CHANGE_PASSWORD: '/auth/change-password/:id',
  // DELETE /auth/credentials/:id
  DELETE: '/auth/credentials/:id',
  // POST /auth/:id/stepup, body as StepupRequest
  STEPUP: '/auth/:id/stepup',
  // GET - get user creds info UserCredentialsInfo format
  CREDS: '/auth/:id/creds',
  // GET - Get authenticated user's profile (validates token)
  ME: '/auth/me',

  // GET /auth/google/:flow - Redirects to Google OAuth with state/flow
  GOOGLE_AUTH: '/auth/google/:flow',
  // GET /auth/google/callback - Handles OAuth callback, redirects to frontend
  GOOGLE_CALLBACK: '/auth/google/callback',

  // POST /auth/google/login - Complete Google login with code
  GOOGLE_LOGIN: '/auth/google/login',
  // POST - Connect google verified email
  GOOGLE_CONNECT: '/auth/:id/google/connect',
} as const;

export const TWO_FACTOR_ROUTES = {
  // POST /auth/2fa/:id/enroll/request - Start enrollment (send code to email)
  REQUEST_ENROLL: '/auth/2fa/:id/enroll/request',

  // POST /auth/2fa/:id/enable - Verify enrollment code
  ENABLE: '/auth/2fa/:id/enable',

  // POST /auth/2fa/:id/stepup/request - Request a step-up (challenge)
  REQUEST_STEPUP: '/auth/2fa/:id/stepup/request',

  // POST /auth/2fa/:id/login/request - Request a login-time 2FA challenge
  REQUEST_LOGIN: '/auth/2fa/:id/login/request',

  // POST - verify login code
  LOGIN: '/auth/2fa/:id/login',

  // POST /auth/2fa/:id/disable/request - Request disable (challenge)
  REQUEST_DISABLE: '/auth/2fa/:id/disable/request',

  // POST /auth/2fa/:id/disable - Disable 2FA after verifying code
  DISABLE: '/auth/2fa/:id/disable',

  // GET - check if user has 2fa enabled
  ENABLED: '/auth/2fa/:id/enabled',
} as const;

export const SCORE_ROUTES = {
  // GET /scores - List scores (with optional query params: ?search=, ?limit=, ?offset=)
  SCORES: '/score',
  // POST /score - Create a new score entry after a game
  SCORE: '/score',
  // GET /score/:id/matches - Get a user's match history
  SCORES_BY_ID: '/score/:id',
  // GET /score/:id/stats - Get a user's statistics
  STATS_BY_ID: '/score/:id/stats',
} as const;

export const AVATAR_ROUTES = {
  // PUT /users/:userId/avatar - Upload/update user avatar (multipart/form-data)
  // DELETE /users/:userId/avatar - delete the user avatar (reset to default)
  USER_AVATAR: '/users/:userId/avatar',
  // POST /users/:userId/avatar/default - Set a default avatar for user (body: { avatarName: string })
  USER_AVATAR_DEFAULT: '/users/:userId/avatar/default',
  // GET /avatars/defaults - Get list of available default avatar options
  AVATARS_DEFAULTS: '/avatars/defaults',
  // GET /avatars/random - Get random cat avatars from TheCatApi (query params: ?limit=, ?imageSize=, ?mimeTypes=)
  AVATARS_RANDOM: '/avatars/random',
} as const;
