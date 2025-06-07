import {
  checkFriendshipExistsSchema,
  FRIENDSHIP_ROUTES,
  paramsIdSchema,
  removeFriendSchema,
  requestFriendSchema,
  standardApiResponses,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/FriendshipController';

export async function registerFriendshipRoutes(app: FastifyInstance) {
  app.get(
    FRIENDSHIP_ROUTES.USER_FRIENDS,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },

    FriendshipController.getFriends,
  );
  app.delete(
    FRIENDSHIP_ROUTES.REMOVE_FRIEND,
    {
      schema: {
        body: removeFriendSchema.body,
        response: standardApiResponses,
      },
    },
    FriendshipController.removeFriend,
  );
  app.post(
    FRIENDSHIP_ROUTES.SEND_REQUEST,
    {
      schema: {
        body: requestFriendSchema.body,
        response: standardApiResponses,
      },
    },
    FriendshipController.sendRequest,
  );
  app.get(
    FRIENDSHIP_ROUTES.INCOMING_REQUESTS,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.getIncomingFriendRequests,
  );
  app.post(
    FRIENDSHIP_ROUTES.FRIEND_ACCEPT,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.acceptFriend,
  );
  app.post(
    FRIENDSHIP_ROUTES.FRIEND_DECLINE,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.declineFriend,
  );

  app.get(
    FRIENDSHIP_ROUTES.FRIEND_EXISTS,
    {
      schema: {
        params: checkFriendshipExistsSchema.params,
        response: standardApiResponses,
      },
    },
    FriendshipController.checkFriendshipExists,
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
