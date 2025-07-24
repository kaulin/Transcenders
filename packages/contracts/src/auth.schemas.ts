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
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});
export type AuthData = Static<typeof authDataSchema>;

export const refreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String(),
});
export type RefreshTokenRequest = Static<typeof refreshTokenRequestSchema>;

export const refreshTokenEntrySchema = Type.Object({
  id: Type.Optional(IdField),
  user_id: UserIdField,
  token_hash: Type.String(),
  expires_at: TimestampField,
  created_at: Type.Optional(TimestampField),
  revoked_at: Type.Optional(Type.Union([TimestampField, Type.Null()])),
});
export type RefreshTokenEntry = Static<typeof refreshTokenEntrySchema>;

export const JWTPayloadSchema = Type.Object({
  userId: UserIdField,
  iat: Type.Number(),
  exp: Type.Number(),
});
export type JWTPayload = Static<typeof JWTPayloadSchema>;

export const changePasswordSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
  body: Type.Object({
    oldPassword: PasswordField,
    newPassword: PasswordField,
  }),
};
export type ChangePasswordRequest = Static<typeof changePasswordSchema.body>;
