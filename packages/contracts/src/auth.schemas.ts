import { Static, Type } from '@sinclair/typebox';
import {
  IdField,
  IdParamField,
  TimestampField,
  UserIdField,
  UsernameField,
} from './user.schemas.js';

export const PasswordField = Type.String({ minLength: 3 });
export const PwHashField = Type.String();

export const registerUserSchema = Type.Object({
  username: UsernameField,
  password: PasswordField,
});
export type RegisterUser = Static<typeof registerUserSchema>;

export const loginUserSchema = Type.Object({
  username: UsernameField,
  password: PasswordField,
});
export type LoginUser = Static<typeof loginUserSchema>;

export const logoutUserSchema = Type.Object({
  refreshToken: Type.String(),
});
export type LogoutUser = Static<typeof logoutUserSchema>;

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

export const deviceInfoSchema = Type.Object({
  userAgent: Type.Optional(Type.String()),
  ipAddress: Type.Optional(Type.String()),
  deviceFingerprint: Type.Optional(Type.String()),
});
export type DeviceInfo = Static<typeof deviceInfoSchema>;

export const refreshTokenSchema = Type.Object({
  id: IdField,
  user_id: UserIdField,
  token_hash: Type.String(),
  jti: Type.String(),
  expires_at: TimestampField,
  created_at: TimestampField,
  revoked_at: Type.Union([TimestampField, Type.Null()]),
  revoke_reason: Type.Optional(Type.String()),
  device_fingerprint: Type.Optional(Type.String()),
  ip_address: Type.Optional(Type.String()),
  user_agent: Type.Optional(Type.String()),
});

// Derive insert schema
export const refreshTokenInsertSchema = Type.Omit(refreshTokenSchema, [
  'id',
  'created_at',
  'revoked_at',
  'revoke_reason',
]);

export type RefreshToken = Static<typeof refreshTokenSchema>;
export type RefreshTokenInsert = Static<typeof refreshTokenInsertSchema>;

export const JWTPayloadSchema = Type.Object({
  userId: UserIdField,
  jti: Type.String(),
  aud: Type.Literal('transcenders'),
  iss: Type.String(),
  iat: Type.Optional(Type.Number()),
  exp: Type.Optional(Type.Number()),
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

export const googleAuthCallbackSchema = Type.Object({
  code: Type.String(),
  state: Type.Optional(Type.String()),
});

export type GoogleAuthCallback = Static<typeof googleAuthCallbackSchema>;

export const googleUserInfoSchema = Type.Object({
  sub: Type.String(),
  email: Type.String(),
  name: Type.String(),
  given_name: Type.String(),
  picture: Type.Optional(Type.String()),
});

export type GoogleUserInfo = Static<typeof googleUserInfoSchema>;
