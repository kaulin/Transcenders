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
import { FriendshipController } from '../controllers/FriendshipController.js';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export async function registerFriendshipRoutes(app: FastifyInstance) {
  app.get(
    FRIENDSHIP_ROUTES.USER_FRIENDSHIPS,
    {
      // TODO maybe just required, so that others can see your friends if needed?
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.required(),
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
