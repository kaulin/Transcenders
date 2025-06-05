export const USER_ROUTES = {
  USERS: '/users',
  USERS_CREATE: '/users/create',
  USER_BY_ID: '/users/:id',
  USER_REMOVE: '/users/remove/:id',
  USER_UPDATE: '/users/update/:id',
  CHECK_USER: '/users/check/:identifier',
  SEARCH_USER: '/users/search',
} as const;
