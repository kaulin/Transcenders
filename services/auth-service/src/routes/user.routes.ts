import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { createUserSchema, updateUserSchema } from '../schemas/user.schemas';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get('/api/users', UserController.getUsers);
  app.post('/api/users', { schema: createUserSchema }, UserController.addUser);
  app.get('/api/users/:id', UserController.getUserById);
  app.get('/api/users/search', UserController.getUser);
  app.patch('/api/users/:id', { schema: updateUserSchema }, UserController.updateUser);
  app.delete('/api/users/:id', UserController.deleteUser);
}

/** get all users

curl -X GET http://localhost:3001/api/users

*/

/** add user (ie: add a user specified in body)

curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "allar", "email": "allar@example.com"}'

 */

/** get a user by id (ie: id 2)

curl -X GET http://localhost:3001/api/users/2

*/

/** get a user by searching with query params (username or email)

curl -X GET http://localhost:3001/api/users/search?username=allar
curl -X GET http://localhost:3001/api/users/search?email=allar@example.com

*/

/** update user (ie: change display name to allar on user ID 1)

curl -X PATCH http://localhost:3001/api/users/1 \
-H "Content-Type: application/json" \
-d '{"display_name": "allar"}'

*/

/** delete user (ie: ID 3)

curl -X DELETE http://localhost:3001/api/users/3

 */
