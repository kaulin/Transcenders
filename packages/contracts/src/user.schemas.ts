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
  modified_at: TimestampField,
});

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

export const updateUserSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
  body: Type.Partial(userModifiableFields, { additionalProperties: false }),
};

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

export const getUserSchema = {
  querystring: Type.Object({
    username: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
  }),
};

export const paramsIdSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};

export const requestFriendSchema = {
  body: Type.Object({
    initiator_id: UserIdField,
    recipient_id: UserIdField,
  }),
};

export const removeFriendSchema = {
  body: Type.Object({
    user_1: UserIdField,
    user_2: UserIdField,
  }),
};

/**
 * RESPONSE DATA SCHEMAS
 */
export const UserExistsDataSchema = Type.Object({
  identifier: IdentifierField,
  exists: Type.Boolean(),
  available: Type.Boolean(),
});

export const DeleteUserDataSchema = Type.Object({
  message: Type.String(),
});

export const FriendRequestsDataSchema = Type.Object({
  id: UserIdField,
  initiator_id: UserIdField,
  recipient_id: UserIdField,
  state: FriendRequestStateField,
  created_at: TimestampField,
  updated_at: TimestampField,
});

export const FriendshipDataSchema = Type.Object({
  user1_id: UserIdField,
  user2_id: UserIdField,
  created_at: TimestampField,
});

/**
 * RESPONSE SCHEMAS
 */

export const ApiResponse = Type.Intersect(
  [
    Type.Object({ success: Type.Boolean() }),
    Type.Union([
      Type.Object({ success: Type.Literal(true), data: Type.Unknown() }),
      Type.Object({ success: Type.Literal(false), error: Type.String() }),
    ]),
  ],
  { $id: 'ApiResponse' },
);

export const standardApiResponses = {
  200: { $ref: 'ApiResponse#' },
  400: { $ref: 'ApiResponse#' },
  404: { $ref: 'ApiResponse#' },
  500: { $ref: 'ApiResponse#' },
} as const;

export type ApiResponse = Static<typeof ApiResponse>;

/**
 * TYPE EXPORTS
 */
export type User = Static<typeof UserSchema>;
export type CreateUserRequest = Static<typeof createUserSchema.body>;
export type UpdateUserRequest = Static<typeof updateUserSchema.body>;
export type GetUserRequest = Static<typeof getUserSchema.querystring>;
export type ParamsIdRequest = Static<typeof paramsIdSchema.params>;
export type UserExistsData = Static<typeof UserExistsDataSchema>;
export type DeleteUserData = Static<typeof DeleteUserDataSchema>;
export type GetUsersQuery = Static<typeof getUsersSchema.querystring>;
export type FriendRequestsData = Static<typeof FriendRequestsDataSchema>;
export type FriendshipData = Static<typeof FriendshipDataSchema>;
export type RequestFriendRequest = Static<typeof requestFriendSchema.body>;
export type RemoveFriendRequest = Static<typeof removeFriendSchema.body>;
