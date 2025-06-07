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
        description: 'List users (with optional query params: ?search=, ?limit=, ?offset=)',
        tags: ['User'],
        querystring: getUsersSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUsers,
  );

  app.post(
    USER_ROUTES.USERS,
    {
      schema: {
        description: 'Create new user',
        tags: ['User'],
        body: createUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.addUser,
  );

  app.get(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Get specific user by ID',
        tags: ['User'],
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.getUserById,
  );

  app.patch(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Update user by ID',
        tags: ['User'],
        params: updateUserSchema.params,
        body: updateUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.updateUser,
  );

  app.delete(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Delete user by ID',
        tags: ['User'],
        params: paramsIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.deleteUser,
  );

  app.get(
    USER_ROUTES.USER_EXISTS,
    {
      schema: {
        description: 'Check if username/email exists',
        tags: ['User'],
        params: checkExistsSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.checkUserExists,
  );

  app.get(
    USER_ROUTES.USERS_EXACT,
    {
      schema: {
        description: 'find user by name or email (query params: ?username=, ?email=)',
        tags: ['User'],
        querystring: getUserSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUserExact,
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
