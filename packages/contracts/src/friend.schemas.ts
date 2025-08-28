import { Static, Type } from '@sinclair/typebox';
import { IdParamField, TimestampField, UserIdField } from './user.schemas.js';

export const getFriendsSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type GetFriendsRequest = Static<typeof getFriendsSchema.params>;

export const getRequestsSchema = {
  params: Type.Object({
    id: IdParamField,
  }),
};
export type GetRequestsRequest = Static<typeof getRequestsSchema.params>;

export const sendFriendRequestSchema = {
  params: Type.Object({
    id: IdParamField,
    targetUserId: IdParamField,
  }),
};
export type SendFriendRequestRequest = Static<typeof sendFriendRequestSchema.params>;

export const acceptFriendRequestSchema = {
  params: Type.Object({
    id: IdParamField,
    requestingUserId: IdParamField,
  }),
};
export type AcceptFriendRequestRequest = Static<typeof acceptFriendRequestSchema.params>;

export const declineFriendRequestSchema = {
  params: Type.Object({
    id: IdParamField,
    requestingUserId: IdParamField,
  }),
};
export type DeclineFriendRequestRequest = Static<typeof declineFriendRequestSchema.params>;

export const relationshipStatusSchema = {
  params: Type.Object({
    id: IdParamField,
    targetUserId: IdParamField,
  }),
};
export type RelationshipStatusRequest = Static<typeof relationshipStatusSchema.params>;

export const removeFriendSchema = {
  params: Type.Object({
    id: IdParamField,
    friendId: IdParamField,
  }),
};
export type RemoveFriendRequest = Static<typeof removeFriendSchema.params>;

/**
 * Data
 */
export const RelationshipStatusSchema = Type.Object({
  status: Type.Union([
    Type.Literal('friends'),
    Type.Literal('request_sent'),
    Type.Literal('request_received'),
    Type.Literal('none'),
  ]),
  friendshipCreatedAt: Type.Optional(TimestampField),
  requestId: Type.Optional(Type.Number()),
  requestCreatedAt: Type.Optional(TimestampField),
  canSendRequest: Type.Boolean(),
});
export type RelationshipStatus = Static<typeof RelationshipStatusSchema>;

export const FriendRequestsDataSchema = Type.Object({
  id: UserIdField,
  initiator_id: UserIdField,
  recipient_id: UserIdField,
  created_at: TimestampField,
  updated_at: TimestampField,
});
export type FriendRequestsData = Static<typeof FriendRequestsDataSchema>;
