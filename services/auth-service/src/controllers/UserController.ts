import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types/user.types';

export class UserController {
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await UserService.getAllUsers({});
      return { success: true, data: users };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async addUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      // safe cast because schema validation ensures the structure matches
      const userdata = request.body as CreateUserRequest;
      const user = await UserService.createUser(userdata);
      reply.code(201);
      return { success: true, data: user };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  }
}
