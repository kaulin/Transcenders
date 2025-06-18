import { Static, Type } from '@sinclair/typebox';
import { IdParamField } from './user.schemas';

export const uploadAvatarSchema = {
  body: Type.Object({
    file: Type.String({ format: 'binary' }),
    userId: Type.String({ pattern: '^[0-9]+$' }),
  }),
};
export type UploadAvatarRequest = Static<typeof uploadAvatarSchema.body>;

export const setDefaultAvatarSchema = {
  params: Type.Object({
    userId: IdParamField,
  }),
  body: Type.Object({
    avatarName: Type.String(),
  }),
};
export type SetDefaultAvatarParams = Static<typeof setDefaultAvatarSchema.params>;
export type SetDefaultAvatarRequest = Static<typeof setDefaultAvatarSchema.body>;
