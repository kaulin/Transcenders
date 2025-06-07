import {
  checkExistsSchema,
  createUserSchema,
  getUserSchema,
  getUsersSchema,
  paramsIdSchema,
  standardApiResponses,
  updateUserSchema,
  USER_ROUTES,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get(
    USER_ROUTES.USERS,
    {
      schema: {
        querystring: getUsersSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUsers,
  );

  app.post(
    USER_ROUTES.USERS_CREATE,
    {
      schema: {
        body: createUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.addUser,
  );

  app.get(
    USER_ROUTES.CHECK_USER,
    {
      schema: {
        params: checkExistsSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.checkUserExists,
  );

  app.get(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.getUserById,
  );

  app.get(
    USER_ROUTES.SEARCH_USER,
    {
      schema: {
        querystring: getUserSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUser,
  );

  app.patch(
    USER_ROUTES.USER_UPDATE,
    {
      schema: {
        params: updateUserSchema.params,
        body: updateUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.updateUser,
  );

  app.delete(
    USER_ROUTES.USER_REMOVE,
    {
      schema: {
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.deleteUser,
  );
}

/** get all users

curl -X GET http://localhost:3001/users

*/

/** add user (ie: add a user specified in body)

curl -X POST http://localhost:3001/users/create \
  -H "Content-Type: application/json" \
  -d '{"username": "allar", "email": "allar@example.com"}'

 */

/** check if user exists (param :identifier can be username or email)

curl -X GET http://localhost:3001/users/check/imnothere
curl -X GET http://localhost:3001/users/check/allar
curl -X GET http://localhost:3001/users/check/allar@example.com

*/

/** get a user by id (ie: id 2)

curl -X GET http://localhost:3001/users/2

*/

/** get a user by searching with query params (username or email)

curl -X GET http://localhost:3001/users/search?username=allar
curl -X GET http://localhost:3001/users/search?email=allar@example.com

*/

/** update user (ie: change display name to allar on user ID 1) NB! invalid keys get scrapped

curl -X PATCH http://localhost:3001/users/update/1 \
-H "Content-Type: application/json" \
-d '{"display_name": "allar"}'

*/

/** delete user (ie: ID 3)

curl -X DELETE http://localhost:3001/users/remove/3

 */
