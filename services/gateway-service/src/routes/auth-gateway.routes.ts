import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth-gateway.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', AuthController.register);
  fastify.post('/auth/login', AuthController.login);
  fastify.patch('/auth/change-password/:id', AuthController.changePassword);
  fastify.delete('/auth/credentials/:id', AuthController.deleteCredentials);
}