import { Static, Type } from '@sinclair/typebox';

/**
 *
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar, TEXT
  language, TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
 * FIELD DEFINITIONS
 */
export const UserIdField = Type.Number();
export const UsernameField = Type.String({ minLength: 3, maxLength: 36 });
export const DisplayNameField = Type.String({ maxLength: 50 });
export const AvatarField = Type.String();
export const LangField = Type.String({ maxLength: 2 });
export const IdField = Type.Number();
export const TimestampField = Type.String();
export const IdParamField = Type.String({ pattern: '^[0-9]+$' });
export const IdentifierField = Type.String({ minLength: 3, maxLength: 50 });

/**
 * ENTITY SCHEMAS
 */
export const userSchema = Type.Object({
  id: UserIdField,
  username: UsernameField,
  display_name: DisplayNameField,
  avatar: AvatarField,
  lang: LangField,
  status: Type.Union([Type.Literal('offline'), Type.Literal('online')]),
  last_activity: TimestampField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type User = Static<typeof userSchema>;

export const userArraySchema = Type.Array(userSchema);
export type UserArray = Static<typeof userArraySchema>;

const userModifiableFields = Type.Object({
  username: UsernameField,
  display_name: DisplayNameField,
  avatar: AvatarField,
  lang: LangField,
});

/**
 * REQUEST SCHEMAS
 */
export const createUserSchema = {
  body: Type.Object({
    username: UsernameField,
    display_name: Type.Optional(DisplayNameField),
    lang: Type.Optional(LangField),
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
  querystring: Type.Object(
    {
      username: Type.String(),
    },
    {
      additionalProperties: false,
    },
  ),
};
export type GetUserRequest = Static<typeof getUserSchema.querystring>;

export const userIdParamSchema = Type.Object({
  id: IdParamField,
});
export type UserIdParam = Static<typeof userIdParamSchema>;

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
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type FriendRequestsData = Static<typeof FriendRequestsDataSchema>;

export const BooleanOperationResultSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type BooleanOperationResult = Static<typeof BooleanOperationResultSchema>;

/**
 * RESPONSE SCHEMAS
 * Enhanced API response with structured error handling and timestamps
 */

export const ServiceErrorSchema = Type.Object({
  codeOrError: Type.String(),
  message: Type.String(),
  localeKey: Type.Optional(Type.String()),
  userMessage: Type.Optional(Type.String()),
  category: Type.String(),
  httpStatus: Type.Number(),
  context: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  timestamp: Type.String(),
});

export const ApiResponseSchema = Type.Union(
  [
    Type.Object({
      success: Type.Literal(true),
      data: Type.Unknown(),
      operation: Type.String(),
      timestamp: Type.String(),
    }),
    Type.Object({
      success: Type.Literal(false),
      error: ServiceErrorSchema,
      operation: Type.String(),
      timestamp: Type.String(),
    }),
  ],
  { $id: 'ApiResponse' },
);

export type ApiResponseType = Static<typeof ApiResponseSchema>;

export const standardApiResponses = {
  default: { $ref: 'ApiResponse' },
} as const;
