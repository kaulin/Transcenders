import {
  ApiErrorHandler,
  CreateUserRequest,
  GetUserRequest,
  GetUsersQuery,
  UpdateUserRequest,
  userByIdRequest,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/UserService.js';

export class UserController {
  // UserController
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as GetUsersQuery;

    const result = await UserService.getAllUsers(query);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async addUser(request: FastifyRequest, reply: FastifyReply) {
    const userdata = request.body as CreateUserRequest;

    const result = await UserService.createUser(userdata);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);

    const result = await UserService.getUserById(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
  // #TODO maybe password protect the Update and Delete for anti drive-by deletes for users
  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);
    const updates = request.body as Partial<UpdateUserRequest>;

    const result = await UserService.updateUser(userId, updates);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as userByIdRequest;
    const userId = parseInt(id);

    const result = await UserService.deleteUser(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async checkUserExists(request: FastifyRequest, reply: FastifyReply) {
    const { identifier } = request.params as { identifier: string };

    const result = await UserService.checkUserExists(identifier);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getUserExact(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as GetUserRequest;

    if ('username' in query && query.username) {
      const result = await UserService.getUserByUsername(query.username);
      return ApiErrorHandler.handleServiceResult(reply, result);
    }
    if ('email' in query && query.email) {
      const result = await UserService.getUserByEmail(query.email);
      return ApiErrorHandler.handleServiceResult(reply, result);
    }
  }
}
