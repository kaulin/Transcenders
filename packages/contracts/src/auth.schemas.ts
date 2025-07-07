import { Static, Type } from '@sinclair/typebox';
import { standardApiResponses } from './api.schemas';
import {
  EmailField,
  IdField,
  IdParamField,
  TimestampField,
  UserIdField,
  UsernameField,
  userByIdSchema, // TODO remove deoendency
} from './user.schemas';

export const PasswordField = Type.String();
export const PwHashField = Type.String();

// ENTITY SCHEMAS
export const userCredentialsEntrySchema = Type.Object({
  user_id: UserIdField,
  pw_hash: PwHashField,
});
export type UserCredentialsEntry = Static<typeof userCredentialsEntrySchema>;

export const userCredentialsSchema = Type.Object({
  id: IdField,
  user_id: UserIdField,
  pw_hash: PwHashField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type UserCredentials = Static<typeof userCredentialsSchema>;

export const authDataSchema = Type.Object({
  accessToken: Type.String(),
});
export type AuthData = Static<typeof authDataSchema>;

export const JWTPayloadSchema = Type.Object({
  userId: UserIdField,
  iat: Type.Number(),
  exp: Type.Number(),
});
export type JWTPayload = Static<typeof JWTPayloadSchema>;

// ROUTE SCHEMAS
export const authRouteSchemas = {
  register: {
    description: 'Authenticate something',
    tags: ['Auth'],
    body: Type.Object({
      username: UsernameField,
      email: EmailField,
      password: PasswordField,
    }),
    response: standardApiResponses,
  },

  login: {
    description: 'Authenticate something',
    tags: ['Auth'],
    body: Type.Object({
      username: UsernameField,
      password: PasswordField,
    }),
    response: standardApiResponses,
  },

  delete: {
    description: 'remove user credentials',
    tags: ['Internal ONLY'],
    params: userByIdSchema.params,
    response: standardApiResponses,
  },

  changePassword: {
    description: 'change user password',
    tags: ['Auth'],
    params: Type.Object({
      id: IdParamField,
    }),
    body: Type.Object({
      oldPassword: PasswordField,
      newPassword: PasswordField,
    }),
    response: standardApiResponses,
  },
} as const;

export type RegisterUser = Static<typeof authRouteSchemas.register.body>;
export type LoginUser = Static<typeof authRouteSchemas.login.body>;
export type ChangePasswordRequest = Static<typeof authRouteSchemas.changePassword.body>;
