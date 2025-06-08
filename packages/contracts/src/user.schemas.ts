import { Static, Type } from '@sinclair/typebox';

/**
 * FIELD DEFINITIONS
 */
const UserIdField = Type.Number();
const UsernameField = Type.String({ minLength: 3, maxLength: 20 });
const EmailField = Type.String({ format: 'email' });
const DisplayNameField = Type.String({ maxLength: 50 });
const IdField = Type.Number();
const TimestampField = Type.String();
const IdParamField = Type.String({ pattern: '^[0-9]+$' });
const IdentifierField = Type.String({ minLength: 3, maxLength: 50 });
const FriendRequestStateField = Type.Union([Type.Literal('pending'), Type.Literal('declined')]);

/**
 * ENTITY SCHEMAS
 */
const UserSchema = Type.Object({
  id: UserIdField,
  username: UsernameField,
  email: EmailField,
  display_name: DisplayNameField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type User = Static<typeof UserSchema>;

const userModifiableFields = Type.Object({
  username: UsernameField,
  email: EmailField,
  display_name: DisplayNameField,
});

/**
 * REQUEST SCHEMAS
 */
export const createUserSchema = {
  body: Type.Object({
    username: UsernameField,
    email: EmailField,
    display_name: Type.Optional(DisplayNameField),
  }),
};
export type CreateUserRequest = Static<typeof createUserSchema.body>;

export const updateUserSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
  body: Type.Partial(userModifiableFields, { additionalProperties: false }),
};
export type UpdateUserRequest = Static<typeof updateUserSchema.body>;

export const checkExistsSchema = {
  params: Type.Object(
    {
      identifier: IdentifierField,
    },
    { additionalProperties: false },
  ),
};

export const getUsersSchema = {
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    offset: Type.Optional(Type.Number({ minimum: 0 })),
  }),
};
export type GetUsersQuery = Static<typeof getUsersSchema.querystring>;

export const getUserSchema = {
  querystring: Type.Union([
    // username only
    Type.Object({
      username: Type.String(),
    }),
    // email only
    Type.Object({
      email: Type.String(),
    }),
    // both username and email
    Type.Object({
      username: Type.String(),
      email: Type.String(),
    }),
  ]),
};
export type GetUserRequest = Static<typeof getUserSchema.querystring>;

export const userByIdSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type userByIdRequest = Static<typeof userByIdSchema.params>;

export const acceptFriendSchema = {
  params: Type.Object({
    id: IdParamField,
    requestId: IdParamField,
  }),
};
export type AcceptFriendRequest = Static<typeof acceptFriendSchema.params>;

export const declineFriendSchema = {
  params: Type.Object({
    id: IdParamField,
    requestId: IdParamField,
  }),
};
export type DeclineFriendRequest = Static<typeof declineFriendSchema.params>;

export const getFriendsSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type GetFriendsRequest = Static<typeof getFriendsSchema.params>;

export const getRequestsSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type GetsRequestsRequest = Static<typeof getRequestsSchema.params>;

// Add this to your user.schemas.ts
export const sendFriendRequestSchema = {
  params: Type.Object({
    id: IdParamField,
    recipientId: IdParamField,
  }),
};
export type SendFriendRequestRequest = Static<typeof sendFriendRequestSchema.params>;

export const removeFriendSchema = {
  params: Type.Object({
    id: IdParamField,
    friendId: IdParamField,
  }),
};
export type RemoveFriendRequest = Static<typeof removeFriendSchema.params>;

export const checkFriendshipExistsSchema = {
  params: Type.Object({
    id1: IdParamField,
    id2: IdParamField,
  }),
};
export type CheckFriendshipExistsRequest = Static<typeof checkFriendshipExistsSchema.params>;

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

export const BooleanOperationResult = Type.Union([
  Type.Object({
    success: Type.Literal(true),
    message: Type.Optional(Type.String()),
  }),
  Type.Object({
    success: Type.Literal(false),
    message: Type.Optional(Type.String()),
  }),
]);
export type BooleanOperationResult = Static<typeof BooleanOperationResult>;

/**
 * RESPONSE SCHEMAS
 */
export const ApiResponse = Type.Intersect(
  [
    Type.Object({ success: Type.Boolean(), operation: Type.String() }),
    Type.Union([
      Type.Object({
        success: Type.Literal(true),
        operation: Type.String(),
        data: Type.Unknown(),
      }),
      Type.Object({
        success: Type.Literal(true),
        operation: Type.String(),
        data: Type.Object({}, { additionalProperties: true }),
      }),
      Type.Object({ success: Type.Literal(false), operation: Type.String(), error: Type.String() }),
    ]),
  ],
  { $id: 'ApiResponse' },
);
export type ApiResponse = Static<typeof ApiResponse>;

export const standardApiResponses = {
  200: { $ref: 'ApiResponse#' },
  400: { $ref: 'ApiResponse#' },
  404: { $ref: 'ApiResponse#' },
  409: { $ref: 'ApiResponse#' },
  500: { $ref: 'ApiResponse#' },
} as const;
