import { Static, Type } from '@sinclair/typebox';
import { IdParamField } from './user.schemas';

export const uploadAvatarSchema = {
  params: Type.Object({
    userId: IdParamField,
  }),
  body: Type.Object({
    file: Type.String({
      format: 'binary',
      description: 'Avatar image file (JPEG, PNG, GIF, WebP, AVIF)',
      contentMediaType: 'image/*',
    }),
  }),
};
export type UploadAvatarRequestParams = Static<typeof uploadAvatarSchema.params>;

export const deleteAvatarSchema = {
  params: Type.Object({
    userId: IdParamField,
  }),
};
export type DeleteAvatarRequestParams = Static<typeof deleteAvatarSchema.params>;

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

export const DefaultAvatarSchema = Type.Object({
  name: Type.String(),
  url: Type.String(),
});
export type DefaultAvatar = Static<typeof DefaultAvatarSchema>;

export const DefaultAvatarsResultSchema = Type.Object({
  avatars: Type.Array(DefaultAvatarSchema),
});
export type DefaultAvatarsResult = Static<typeof DefaultAvatarsResultSchema>;

export const avatarResultSchema = Type.Object({
  success: Type.Boolean(),
  url: Type.String(),
});
export type AvatarResult = Static<typeof avatarResultSchema>;

export const randomAvatarResultSchema = Type.Object({
  id: Type.String(),
  url: Type.String(),
  width: Type.String(),
  height: Type.String(),
});
export type RandomAvatarResult = Static<typeof randomAvatarResultSchema>;

export const randomCatsRequestSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    imageSize: Type.Optional(Type.String()),
    mimeTypes: Type.Optional(Type.String()),
  }),
};
export type RandomCatsQuery = Static<typeof randomCatsRequestSchema.querystring>;
