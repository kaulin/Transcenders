import {
  CheckFriendshipExistsParams,
  ParamsIdRequest,
  RemoveFriendRequest,
  RequestFriendRequest,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FriendshipService } from '../services/FriendshipService';
import { ResponseHelper } from '../utils/responseHelper';

export class FriendshipController {
  static async getFriends(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getUserFriends(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async sendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { initiator_id, recipient_id } = request.body as RequestFriendRequest;

    const result = await FriendshipService.sendFriendRequest(initiator_id, recipient_id);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async getIncomingFriendRequests(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getIncomingFriendRequests(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async acceptFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const friendRequestId = parseInt(id);

    const result = await FriendshipService.acceptFriend(friendRequestId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async declineFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const friendRequestId = parseInt(id);

    const result = await FriendshipService.declineFriend(friendRequestId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async removeFriend(request: FastifyRequest, reply: FastifyReply) {
    const { user_1, user_2 } = request.body as RemoveFriendRequest;

    const result = await FriendshipService.removeFriend(user_1, user_2);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async checkFriendshipExists(request: FastifyRequest, reply: FastifyReply) {
    const { id1, id2 } = request.params as CheckFriendshipExistsParams;

    const userId1 = parseInt(id1);
    const userId2 = parseInt(id2);
    const result = await FriendshipService.checkFriendshipExists(userId1, userId2);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
