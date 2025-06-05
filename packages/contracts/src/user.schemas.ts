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
