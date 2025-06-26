import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

export default async function userRoutes(fastify: FastifyInstance) {

  // User routes
  fastify.get('/users', UserController.getUsers);
  fastify.post('/users', UserController.addUser);
  fastify.get('/users/:id', UserController.getUserById);
  fastify.patch('/users/:id', UserController.updateUser);
  fastify.delete('/users/:id', UserController.deleteUser);
  fastify.get('/users/:id/exists', UserController.checkUserExists);
  fastify.get('users/exact', UserController.getUserExact);
  
  // Friendship routes
  fastify.get('/users/:id/friendships', UserController.getFriends);
  fastify.delete('/users/:id/friendships/:friendId', UserController.removeFriend);
  fastify.get('/users/:id/friend-requests', UserController.getRequests);
  fastify.post('/users/:id/friend-requests/:recipientId', UserController.sendRequest);
  fastify.put('/users/:id/friend-requests/:requestId', UserController.acceptFriend);
  fastify.delete('/users/:id/friend-requests/:requestId', UserController.declineFriend);
  fastify.get('/friendships/:id1/:id2', UserController.checkFriendshipExists);
}