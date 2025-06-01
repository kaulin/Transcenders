import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { createUserSchema, getUsersSchema, updateUserSchema } from '../schemas/user.schemas';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get('/api/users', { schema: getUsersSchema }, UserController.getUsers);
  app.post('/api/users', { schema: createUserSchema }, UserController.addUser);
  app.get('/api/users/:id', UserController.getUserById);
  app.patch('/api/users/:id', { schema: updateUserSchema }, UserController.updateUser);
  app.delete('/api/users/:id', UserController.deleteUser);
  app.get('/api/users/search', UserController.getUser);
}

/** add user

curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "allar", "email": "allar@example.com"}'

 */

/** delete user at ID 3

curl -X DELETE http://localhost:3001/api/users/3

 */

/** modify user (change display name to Allar on user ID 1)

curl -X PATCH http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"display_name": "allar"}'

 */
