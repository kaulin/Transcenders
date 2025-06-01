import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest, UserExistsResponse } from '../types/user.types';
import { ResponseHelper } from '../utils/responseHelpers';

export class UserController {
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.getAllUsers({});
    return ResponseHelper.success(reply, users);
  }

  static async checkUserExists(request: FastifyRequest, reply: FastifyReply) {
    const { identifier } = request.params as { identifier: string };
    const exists = await UserService.checkUserExists(identifier);
    const response: UserExistsResponse = {
      exists,
      identifier,
      available: !exists,
    };
    return ResponseHelper.success(reply, response);
  }

  static async addUser(request: FastifyRequest, reply: FastifyReply) {
    const userdata = request.body as CreateUserRequest;
    const user = await UserService.createUser(userdata);
    if (!user) {
      ResponseHelper.throwError('Failed to create user');
    }
    return ResponseHelper.success(reply, user, 201);
  }

  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);

    if (isNaN(userId) || userId <= 0) {
      ResponseHelper.throwBadRequest('Invalid user ID');
    }

    const updates = request.body as Partial<UpdateUserRequest>;
    const updatedUser = await UserService.updateUser(userId, updates);
    if (!updatedUser) {
      ResponseHelper.throwNotFound('User not found');
    }
    return ResponseHelper.success(reply, updatedUser);
  }

  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      ResponseHelper.throwBadRequest('Invalid user ID');
    }
    const deleted = await UserService.deleteUser(userId);
    if (!deleted) {
      ResponseHelper.throwNotFound('User not found');
    }
    return ResponseHelper.success(reply, { message: 'User deleted successfully' });
  }

  static async getUser(request: FastifyRequest, reply: FastifyReply) {
    const { username, email } = request.query as { username?: string; email?: string };

    if (username) {
      const user = await UserService.getUserByUsername(username);
      if (!user) {
        ResponseHelper.throwNotFound('User not found');
      }
      return ResponseHelper.success(reply, user);
    }

    if (email) {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        ResponseHelper.throwNotFound('User not found');
      }
      return ResponseHelper.success(reply, user);
    }
    ResponseHelper.throwBadRequest('Must provide username or email parameter');
  }

  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      ResponseHelper.throwBadRequest('Invalid user ID');
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      ResponseHelper.throwNotFound('User not found');
    }
    return ResponseHelper.success(reply, user);
  }
}
