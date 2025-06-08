import {
  acceptFriendSchema,
  checkFriendshipExistsSchema,
  declineFriendSchema,
  FRIENDSHIP_ROUTES,
  getFriendsSchema,
  getRequestsSchema,
  removeFriendSchema,
  sendFriendRequestSchema,
  standardApiResponses,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/FriendshipController';

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
    FRIENDSHIP_ROUTES.FRIENDSHIP,
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
    FRIENDSHIP_ROUTES.USER_FRIEND_REQUESTS,
    {
      schema: {
        description: 'Get incoming friend requests for a user',
        tags: ['friendship'],
        params: getRequestsSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.getRequests,
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
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: {
        description: 'Accept a friend request',
        tags: ['friendship'],
        params: acceptFriendSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.acceptFriend,
  );
  app.delete(
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: {
        description: 'Decline/cancel a friend request',
        tags: ['friendship'],
        params: declineFriendSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.declineFriend,
  );

  app.get(
    FRIENDSHIP_ROUTES.FRIENDSHIP_EXISTS,
    {
      schema: {
        description: 'Check if friendship exists between two users',
        tags: ['friendship'],
        params: checkFriendshipExistsSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.checkFriendshipExists,
  );
}
