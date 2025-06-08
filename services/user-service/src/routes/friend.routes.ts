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
