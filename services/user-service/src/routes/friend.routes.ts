import {
  FRIENDSHIP_ROUTES,
  paramsIdSchema,
  removeFriendSchema,
  requestFriendSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/FriendshipController';

export async function registerFriendshipRoutes(app: FastifyInstance) {
  app.get(
    FRIENDSHIP_ROUTES.USER_FRIENDS,
    { schema: paramsIdSchema },
    FriendshipController.getFriends,
  );
  app.delete(
    FRIENDSHIP_ROUTES.REMOVE_FRIEND,
    { schema: removeFriendSchema },
    FriendshipController.removeFriend,
  );
  app.post(
    FRIENDSHIP_ROUTES.SEND_REQUEST,
    { schema: requestFriendSchema },
    FriendshipController.sendRequest,
  );
  app.get(
    FRIENDSHIP_ROUTES.INCOMING_REQUESTS,
    { schema: paramsIdSchema },
    FriendshipController.getIncomingFriendRequests,
  );
  app.post(
    FRIENDSHIP_ROUTES.FRIEND_ACCEPT,
    { schema: paramsIdSchema },
    FriendshipController.acceptFriend,
  );
  app.post(
    FRIENDSHIP_ROUTES.FRIEND_DECLINE,
    { schema: paramsIdSchema },
    FriendshipController.declineFriend,
  );
}
