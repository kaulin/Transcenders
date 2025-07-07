import { FastifyInstance } from 'fastify';
import {
  USER_ROUTES,
  FRIENDSHIP_ROUTES,
  userRouteSchemas,
  friendshipRouteSchemas,
} from '@transcenders/contracts';
import { UserController } from '../controllers/user-gateway.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    USER_ROUTES.USERS,
    {
      schema: userRouteSchemas.getUsers,
    },
    UserController.getUsers,
  );

  fastify.post(
    USER_ROUTES.USERS,
    {
      schema: userRouteSchemas.addUser,
    },
    UserController.addUser,
  );

  fastify.get(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.getUserById,
    },
    UserController.getUserById,
  );

  fastify.patch(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.updateUser,
    },
    UserController.updateUser,
  );

  fastify.delete(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.deleteUser,
    },
    UserController.deleteUser,
  );

  fastify.get(
    USER_ROUTES.USER_EXISTS,
    {
      schema: userRouteSchemas.checkUserExists,
    },
    UserController.checkUserExists,
  );

  fastify.get(
    USER_ROUTES.USERS_EXACT,
    {
      schema: userRouteSchemas.getUserExact,
    },
    UserController.getUserExact,
  );

  // Friendship routes
  fastify.get(
    FRIENDSHIP_ROUTES.USER_FRIENDSHIPS,
    {
      schema: friendshipRouteSchemas.getFriends,
    },

    UserController.getFriends,
  );

  fastify.delete(
    FRIENDSHIP_ROUTES.FRIENDSHIP,
    {
      schema: friendshipRouteSchemas.removeFriend,
    },
    UserController.removeFriend,
  );

  fastify.get(
    FRIENDSHIP_ROUTES.USER_FRIEND_REQUESTS,
    {
      schema: friendshipRouteSchemas.getRequests,
    },
    UserController.getRequests,
  );

  fastify.post(
    FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.sendRequest,
    },
    UserController.sendRequest,
  );
  fastify.put(
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.acceptFriend,
    },
    UserController.acceptFriend,
  );
  fastify.delete(
    FRIENDSHIP_ROUTES.FRIEND_REQUEST,
    {
      schema: friendshipRouteSchemas.declineFriend,
    },
    UserController.declineFriend,
  );

  fastify.get(
    FRIENDSHIP_ROUTES.FRIENDSHIP_EXISTS,
    {
      schema: friendshipRouteSchemas.checkFriendshipExists,
    },
    UserController.checkFriendshipExists,
  );
}
