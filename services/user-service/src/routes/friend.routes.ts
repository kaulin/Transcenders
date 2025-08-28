import {
  acceptFriendRequestSchema,
  declineFriendRequestSchema,
  FRIENDSHIP_ROUTES,
  getFriendsSchema,
  getRequestsSchema,
  relationshipStatusSchema,
  removeFriendSchema,
  sendFriendRequestSchema,
  standardApiResponses,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/FriendshipController.js';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export async function registerFriendshipRoutes(app: FastifyInstance) {
  app.get(
    FRIENDSHIP_ROUTES.USER_FRIENDSHIPS,
    {
      schema: {
        description: 'Get all friends for a user',
        tags: ['friendship'],
        params: getFriendsSchema.params,
        response: standardApiResponses,
      },
    },

    FriendshipController.getFriends,
  );

  app.delete(
    FRIENDSHIP_ROUTES.REMOVE_FRIENDSHIP,
    {
      schema: {
        description: 'Remove a friendship',
        tags: ['friendship'],
        params: removeFriendSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.removeFriend,
  );

  app.get(
    FRIENDSHIP_ROUTES.FRIEND_REQUESTS_INCOMING,
    {
      schema: {
        description: 'Get incoming friend requests for a user',
        tags: ['friendship'],
        params: getRequestsSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.getIncomingRequests,
  );

  app.get(
    FRIENDSHIP_ROUTES.FRIEND_REQUESTS_OUTGOING,
    {
      schema: {
        description: 'Get outgoing friend requests for a user',
        tags: ['friendship'],
        params: getRequestsSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.getOutgoingRequests,
  );

  app.post(
    FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST,
    {
      schema: {
        description: 'Send friend request to specific user',
        tags: ['friendship'],
        params: sendFriendRequestSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.sendRequest,
  );
  app.put(
    FRIENDSHIP_ROUTES.ACCEPT_FRIEND_REQUEST,
    {
      schema: {
        description: 'Accept a friend request',
        tags: ['friendship'],
        params: acceptFriendRequestSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.acceptFriend,
  );
  app.delete(
    FRIENDSHIP_ROUTES.DECLINE_FRIEND_REQUEST,
    {
      schema: {
        description: 'Decline/cancel a friend request',
        tags: ['friendship'],
        params: declineFriendRequestSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.declineFriend,
  );

  app.get(
    FRIENDSHIP_ROUTES.RELATIONSHIP_STATUS,
    {
      schema: {
        description: 'Get relationship status with another user',
        tags: ['friendship'],
        params: relationshipStatusSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.getRelationshipStatus,
  );
}
