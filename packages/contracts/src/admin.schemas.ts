import { Static, Type } from '@sinclair/typebox';
import { IdParamField } from './user.schemas';

export const userActivitySchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type UserActivity = Static<typeof userActivitySchema.params>;
