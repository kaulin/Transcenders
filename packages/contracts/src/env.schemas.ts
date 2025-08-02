import { Static, Type } from '@sinclair/typebox';

export const envVarSchema = Type.Object({
  USER_SERVICE_URL: Type.String(),
  AUTH_SERVICE_URL: Type.String(),
  SCORE_SERVICE_URL: Type.String(),
  NODE_ENV: Type.Union(
    [Type.Literal('development'), Type.Literal('production'), Type.Literal('test')],
    { default: 'development' },
  ),
  PORT: Type.Optional(Type.Integer({ minimum: 1, maximum: 65535 })),
  HOST: Type.Optional(Type.String({ default: '0.0.0.0' })),
  JWT_ACCESS_SECRET: Type.String(),
  JWT_REFRESH_SECRET: Type.String(),
  HOST_UID: Type.Number(),
  HOST_GID: Type.Number(),
  PROJECT_ROOT: Type.String(),
  OAUTH_CLIENT_ID: Type.String(),
  OAUTH_CLIENT_SECRET: Type.String(),
  GOOGLE_REDIRECT_URI: Type.String(),
});

export type Env = Static<typeof envVarSchema>;
