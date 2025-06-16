import { Static, Type } from '@sinclair/typebox';
import {
  EmailField,
  IdField,
  IdParamField,
  TimestampField,
  UserIdField,
  UsernameField,
} from './user.schemas';

export const PasswordField = Type.String();
export const PwHashField = Type.String();

export const registerUserSchema = Type.Object({
  username: UsernameField,
  email: EmailField,
  password: PasswordField,
});
export type RegisterUser = Static<typeof registerUserSchema>;

export const loginUserSchema = Type.Object({
  username: UsernameField,
  password: PasswordField,
});
export type LoginUser = Static<typeof loginUserSchema>;

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

const authModifiableFields = Type.Object({
  pw_hash: PwHashField,
});

export const updateUserCredentialsSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
  body: Type.Partial(authModifiableFields, { additionalProperties: false }),
};
export type UpdateUserCredentials = Static<typeof updateUserCredentialsSchema.body>;
