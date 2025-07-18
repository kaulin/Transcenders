import { Static, Type } from '@sinclair/typebox';
import { IdParamField } from './user.schemas';

export const userActivitySchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type UserActivity = Static<typeof userActivitySchema.params>;

export const cleanupOfflineUsersSchema = {
  querystring: Type.Object({
    timeoutMinutes: Type.Optional(Type.Number()),
  }),
};
export type CleanupOfflineQuery = Static<typeof cleanupOfflineUsersSchema.querystring>;
