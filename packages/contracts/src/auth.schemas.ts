import { Static, Type } from '@sinclair/typebox';
import {
  IdField,
  IdParamField,
  TimestampField,
  UserIdField,
  UsernameField,
} from './user.schemas.js';

export const PasswordField = Type.String({ minLength: 3 });
export const PwHashField = Type.Union([Type.String(), Type.Null()]);
export const TwoFactorStatusField = Type.Union([Type.Literal('verified'), Type.Literal('pending')]);
export const OptionalBooleanNullField = Type.Union([
  Type.Literal(1),
  Type.Literal(0),
  Type.Boolean(),
  Type.Null(),
]);

export const registerUserSchema = Type.Object({
  username: UsernameField,
  password: PasswordField,
});
export type RegisterUser = Static<typeof registerUserSchema>;

export const loginUserSchema = Type.Object({
  username: UsernameField,
  password: PasswordField,
  code: Type.Optional(Type.String()),
});
export type LoginUser = Static<typeof loginUserSchema>;

export const logoutUserSchema = Type.Object({
  refreshToken: Type.String(),
});
export type LogoutUser = Static<typeof logoutUserSchema>;

export const userCredentialsEntrySchema = Type.Object({
  user_id: UserIdField,
  pw_hash: PwHashField,
  google_linked: OptionalBooleanNullField,
  two_fac_enabled: OptionalBooleanNullField,
});
export type UserCredentialsEntry = Static<typeof userCredentialsEntrySchema>;

export const userCredentialsInfoSchema = Type.Object({
  userId: UserIdField,
  hasPassword: Type.Boolean(),
  googleLinked: Type.Boolean(),
  twoFacEnabled: Type.Boolean(),
});
export type UserCredentialsInfo = Static<typeof userCredentialsInfoSchema>;

export const userCredentialsSchema = Type.Object({
  id: IdField,
  user_id: UserIdField,
  pw_hash: PwHashField,
  google_linked: OptionalBooleanNullField,
  two_fac_enabled: OptionalBooleanNullField,
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

export const authDataAccessOnlySchema = Type.Pick(authDataSchema, ['accessToken']);
export type authDataAccessOnly = Static<typeof authDataAccessOnlySchema>;

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
  revoke_reason: Type.Union([Type.String(), Type.Null()]),
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

const STEPUP_METHODS = ['password', '2fa', 'google'] as const;
export type StepupMethod = (typeof STEPUP_METHODS)[number];
export const stepupMethodsSchema = Type.Union(STEPUP_METHODS.map((value) => Type.Literal(value)));

export const JWTPayloadSchema = Type.Object({
  userId: UserIdField,
  jti: Type.String(),
  aud: Type.Literal('transcenders'),
  iss: Type.String(),
  iat: Type.Optional(Type.Number()),
  exp: Type.Optional(Type.Number()),
  stepup: Type.Optional(Type.Boolean()),
  stepup_method: Type.Optional(stepupMethodsSchema),
});
export type JWTPayload = Static<typeof JWTPayloadSchema>;

export const stepupPasswordSchema = Type.Object({
  method: Type.Literal('password'),
  password: PasswordField,
});

export const stepup2faSchema = Type.Object({
  method: Type.Literal('2fa'),
  code: Type.String(),
});

export const stepupGoogleSchema = Type.Object({
  method: Type.Literal('google'),
  googleCode: Type.String(),
});

export const stepupRequestSchema = Type.Union([
  stepupPasswordSchema,
  stepup2faSchema,
  stepupGoogleSchema,
]);

export type StepupRequest = Static<typeof stepupRequestSchema>;

export const changePasswordSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
  body: Type.Object({
    newPassword: PasswordField,
  }),
};
export type ChangePasswordRequest = Static<typeof changePasswordSchema.body>;

const GOOGLE_FLOW_VALUES = ['login', 'stepup', 'error', 'enable'] as const;

export type GoogleFlows = (typeof GOOGLE_FLOW_VALUES)[number];

export const googleFlowsSchema = Type.Union(GOOGLE_FLOW_VALUES.map((value) => Type.Literal(value)));

export const googleFlowParamSchema = Type.Object({
  flow: Type.String({
    enum: GOOGLE_FLOW_VALUES,
  }),
});
export type GoogleFlowParam = Static<typeof googleFlowParamSchema>;

export const googleAuthCallbackSchema = Type.Object({
  code: Type.Optional(Type.String()),
  error: Type.Optional(Type.String()),
  state: Type.String({
    enum: GOOGLE_FLOW_VALUES,
  }),
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

export const googleUserLogin = Type.Object({
  code: Type.String(),
});
export type GoogleUserLogin = Static<typeof googleUserLogin>;

export const googleUserSetPasswordSchema = Type.Object({
  code: Type.String(),
  password: PasswordField,
});
export type GoogleUserSetPassword = Static<typeof googleUserSetPasswordSchema>;
