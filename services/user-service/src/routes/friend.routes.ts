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

/** get user's friends (ie: get friends for user ID 1)

curl -X GET http://localhost:3001/users/1/friends

*/

/** remove friendship

curl -X DELETE http://localhost:3001/friend/remove \
  -H "Content-Type: application/json" \
  -d '{"user1_id": 1, "user2_id": 2}'

*/

/** send friend request

curl -X POST http://localhost:3001/friend/request \
  -H "Content-Type: application/json" \
  -d '{"initiator_id": 1, "recipient_id": 2}'

*/

/** get incoming friend requests (ie: for user ID 1)

curl -X GET http://localhost:3001/friend/requests/1

*/

/** accept friend request (ie: accept request ID 5)

curl -X POST http://localhost:3001/friend/accept/5

*/

/** decline friend request (ie: decline request ID 5)

curl -X POST http://localhost:3001/friend/decline/5

*/
