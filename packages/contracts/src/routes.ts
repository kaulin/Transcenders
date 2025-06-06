export const USER_ROUTES = {
  USERS: '/users',
  USERS_CREATE: '/users/create',
  USER_BY_ID: '/users/:id',
  USER_REMOVE: '/users/remove/:id',
  USER_UPDATE: '/users/update/:id',
  CHECK_USER: '/users/check/:identifier',
  SEARCH_USER: '/users/search',
} as const;

export const FRIENDSHIP_ROUTES = {
  USER_FRIENDS: '/users/:id/friends',
  REMOVE_FRIEND: '/friend/remove',
  SEND_REQUEST: '/friend/request',
  INCOMING_REQUESTS: '/friend/requests/:id',
  FRIEND_ACCEPT: '/friend/accept/:id',
  FRIEND_DECLINE: '/friend/decline/:id',
} as const;
