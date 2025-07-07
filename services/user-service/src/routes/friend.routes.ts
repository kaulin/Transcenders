import {
  FRIENDSHIP_ROUTES,
  friendshipRouteSchemas,
  standardApiResponses,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/friendship.controller';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export default async function friendshipRoutes(fastify: FastifyInstance) {
  fastify.get(
    FRIENDSHIP_ROUTES.USER_FRIENDSHIPS,
    {
      schema: friendshipRouteSchemas.getFriends,
    },

    FriendshipController.getFriends,
  );

  fastify.delete(
    FRIENDSHIP_ROUTES.FRIENDSHIP,
    {
      schema: friendshipRouteSchemas.removeFriend,
    },
    FriendshipController.removeFriend,
  );

  fastify.get(
    FRIENDSHIP_ROUTES.USER_FRIEND_REQUESTS,
    {
      schema: friendshipRouteSchemas.getRequests,
    },
    FriendshipController.getRequests,
  );

  fastify.post(
    FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.sendRequest,
    },
    FriendshipController.sendRequest,
  );
  fastify.put(
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.acceptFriend,
    },
    FriendshipController.acceptFriend,
  );
  fastify.delete(
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.declineFriend,
    },
    FriendshipController.declineFriend,
  );

  fastify.get(
    FRIENDSHIP_ROUTES.FRIENDSHIP_EXISTS,
    {
      schema: friendshipRouteSchemas.checkFriendshipExists,
    },
    FriendshipController.checkFriendshipExists,
  );
}
