import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

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
      // maybe make types from schemas later for easier types
      const userdata = request.body as CreateUserRequest;
      const user = await UserService.createUser(userdata);
      reply.code(201);
      return { success: true, data: user };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  }

  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id);

      if (isNaN(userId) || userId <= 0) {
        reply.code(400);
        return { success: false, error: 'Invalid user ID' };
      }

      const updates = request.body as Partial<UpdateUserRequest>;
      const updatedUser = await UserService.updateUser(userId, updates);
      if (!updatedUser) {
        reply.code(404);
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id);
      if (isNaN(userId) || userId <= 0) {
        reply.code(400);
        return { success: false, error: 'invalid used ID' };
      }
      const deleted = await UserService.deleteUser(userId);
      if (!deleted) {
        reply.code(404);
        return { success: false, error: 'User not found' };
      }

      reply.code(200);
      return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, email } = request.query as { username?: string; email?: string };

      if (username) {
        const user = await UserService.getUserByUsername(username);
        if (!user) {
          reply.code(404);
          return { success: false, error: 'User not found' };
        }
        return { success: true, data: user };
      }

      if (email) {
        const user = await UserService.getUserByEmail(email);
        if (!user) {
          reply.code(404);
          return { success: false, error: 'User not found' };
        }
        return { success: true, data: user };
      }
      reply.code(400);
      return { success: false, error: 'Must provide username or email parameter' };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  }

  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const userId = parseInt(id);
      if (isNaN(userId) || userId <= 0) {
        reply.code(400);
        return { success: false, error: 'invalid user ID' };
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        reply.code(404);
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
