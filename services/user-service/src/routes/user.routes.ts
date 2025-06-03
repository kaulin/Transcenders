import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import {
  checkExistsSchema,
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  updateUserSchema,
} from '@transcenders/contracts';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get('/users', UserController.getUsers);
  app.post('/users', { schema: createUserSchema }, UserController.addUser);
  app.get(
    '/users/check/:identifier',
    { schema: checkExistsSchema },
    UserController.checkUserExists,
  );
  app.get('/users/:id', { schema: getUserByIdSchema }, UserController.getUserById);
  app.get('/users/search', UserController.getUser);
  app.patch('/users/:id', { schema: updateUserSchema }, UserController.updateUser);
  app.delete('/users/:id', { schema: deleteUserSchema }, UserController.deleteUser);
}

/** get all users

curl -X GET http://localhost:3001/users

*/

/** add user (ie: add a user specified in body)

curl -X POST http://localhost:3001/users \
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

curl -X PATCH http://localhost:3001/users/1 \
-H "Content-Type: application/json" \
-d '{"display_name": "allar"}'

*/

/** delete user (ie: ID 3)

curl -X DELETE http://localhost:3001/users/3

 */
