import { Static, Type } from '@sinclair/typebox';
import { standardApiResponses } from './api.schemas';

/**
 *
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar, TEXT
  language, TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 * FIELD DEFINITIONS
 */
export const UserIdField = Type.Number();
export const UsernameField = Type.String({ minLength: 3, maxLength: 20 });
export const EmailField = Type.String({
  pattern: `^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$`,
});
export const DisplayNameField = Type.String({ maxLength: 50 });
export const AvatarField = Type.String();
export const LangField = Type.String({ maxLength: 2 });
export const IdField = Type.Number();
export const TimestampField = Type.String();
export const IdParamField = Type.String({ pattern: '^[0-9]+$' });
export const IdentifierField = Type.String({ minLength: 3, maxLength: 50 });
export const FriendRequestStateField = Type.Union([
  Type.Literal('pending'),
  Type.Literal('declined'),
]);

// ENTITY SCHEMAS
export const UserSchema = Type.Object({
  id: UserIdField,
  username: UsernameField,
  email: EmailField,
  display_name: DisplayNameField,
  avatar: AvatarField,
  lang: LangField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type User = Static<typeof UserSchema>;

export const UsersArraySchema = Type.Array(UserSchema);
export type UsersArray = Static<typeof UsersArraySchema>;

const userModifiableFields = Type.Object({
  username: UsernameField,
  email: EmailField,
  display_name: DisplayNameField,
  avatar: AvatarField,
  lang: LangField,
});

// ROUTE SCHEMAS

// TODO Used in several places, need to kill dependency/refactor
export const userByIdSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};

export const userRouteSchemas = {
  getUsers: {
    description: 'List users (with optional query params: ?search=, ?limit=, ?offset=)',
    tags: ['User'],
    querystring: Type.Object({
      search: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
      offset: Type.Optional(Type.Number({ minimum: 0 })),
    }),
    response: standardApiResponses,
  },

  addUser: {
    description: 'Create new user',
    tags: ['Internal ONLY'],
    body: Type.Object({
      username: UsernameField,
      email: EmailField,
      display_name: Type.Optional(DisplayNameField),
      lang: Type.Optional(LangField),
    }),
    response: standardApiResponses,
  },

  getUserById: {
    description: 'Get specific user by ID',
    tags: ['User'],
    params: Type.Object({
      id: IdParamField,
    }),
    response: standardApiResponses,
  },

  updateUser: {
    description: 'Update user by ID',
    tags: ['User'],
    params: Type.Object({
      id: IdParamField,
    }),
    body: Type.Partial(userModifiableFields, { additionalProperties: false }),
    response: standardApiResponses,
  },

  deleteUser: {
    description: 'Delete user by ID',
    tags: ['User'],
    params: userByIdSchema.params,
    response: standardApiResponses,
  },

  checkUserExists: {
    description: 'Check if username/email exists',
    tags: ['User'],
    params: Type.Object(
      {
        identifier: IdentifierField,
      },
      { additionalProperties: false },
    ),
    response: standardApiResponses,
  },

  getUserExact: {
    description: 'find user by name or email (query params: ?username=, ?email=)',
    tags: ['User'],
    querystring: Type.Object(
      {
        username: Type.Optional(Type.String()),
        email: Type.Optional(Type.String()),
      },
      {
        minProperties: 1,
        additionalProperties: false,
      },
    ),
    response: standardApiResponses,
  },
} as const;

export const friendshipRouteSchemas = {
  getFriends: {
    description: 'Get all friends for a user',
    tags: ['Friendship'],
    params: Type.Object({
      id: IdParamField,
    }),
    response: standardApiResponses,
  },

  removeFriend: {
    description: 'Remove a friendship',
    tags: ['Friendship'],
    params: Type.Object({
      id1: IdParamField,
      id2: IdParamField,
    }),
    response: standardApiResponses,
  },

  getRequests: {
    description: 'Get incoming friend requests for a user',
    tags: ['Friendship'],
    params: Type.Object({
      id: IdParamField,
    }),
    response: standardApiResponses,
  },

  sendRequest: {
    description: 'Send friend request to specific user',
    tags: ['Friendship'],
    params: Type.Object({
      id: IdParamField,
      recipientId: IdParamField,
    }),
    response: standardApiResponses,
  },

  acceptFriend: {
    description: 'Accept a friend request',
    tags: ['Friendship'],
    params: Type.Object({
      id: IdParamField,
      requestId: IdParamField,
    }),
    response: standardApiResponses,
  },

  declineFriend: {
    description: 'Decline/cancel a friend request',
    tags: ['Friendship'],
    params: Type.Object({
      id: IdParamField,
      requestId: IdParamField,
    }),
    response: standardApiResponses,
  },

  checkFriendshipExists: {
    description: 'Check if friendship exists between two users',
    tags: ['Friendship'],
    params: Type.Object({
      id1: IdParamField,
      id2: IdParamField,
    }),
    response: standardApiResponses,
  },
};

// REQUEST TYPES
export type CreateUserRequest = Static<typeof userRouteSchemas.addUser.body>;
export type UpdateUserRequest = Static<typeof userRouteSchemas.updateUser.body>;
export type GetUsersQuery = Static<typeof userRouteSchemas.getUsers.querystring>;
export type GetUserRequest = Static<typeof userRouteSchemas.getUserExact.querystring>;
export type CheckUserExists = Static<typeof userRouteSchemas.checkUserExists.params>;
export type UserByIdRequest = Static<typeof userRouteSchemas.getUserById.params>;

export type AcceptFriendRequest = Static<typeof friendshipRouteSchemas.acceptFriend.params>;
export type DeclineFriendRequest = Static<typeof friendshipRouteSchemas.declineFriend.params>;
export type GetFriendsRequest = Static<typeof friendshipRouteSchemas.getFriends.params>;
export type GetRequestsRequest = Static<typeof friendshipRouteSchemas.getRequests.params>;
export type SendFriendRequestRequest = Static<typeof friendshipRouteSchemas.sendRequest.params>;
export type RemoveFriendRequest = Static<typeof friendshipRouteSchemas.removeFriend.params>;
export type CheckFriendshipExistsRequest = Static<
  typeof friendshipRouteSchemas.checkFriendshipExists.params
>;

/**
 * RESPONSE DATA SCHEMAS
 */

export const FriendRequestsDataSchema = Type.Object({
  id: UserIdField,
  initiator_id: UserIdField,
  recipient_id: UserIdField,
  state: FriendRequestStateField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type FriendRequestsData = Static<typeof FriendRequestsDataSchema>;

export const BooleanOperationResultSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type BooleanOperationResult = Static<typeof BooleanOperationResultSchema>;
