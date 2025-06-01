import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { createUserSchema, getUsersSchema } from '../schemas/user.schemas';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get('/api/users', { schema: getUsersSchema }, UserController.getUsers);
  app.post('/api/users', { schema: createUserSchema }, UserController.addUser);
  app.get('/api/users/:id', UserController.getUserById);
  app.get('/api/users/search', UserController.getUser);
}
