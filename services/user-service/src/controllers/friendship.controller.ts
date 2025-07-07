import {
  AcceptFriendRequest,
  CheckFriendshipExistsRequest,
  DeclineFriendRequest,
  GetFriendsRequest,
  GetRequestsRequest,
  RemoveFriendRequest,
  ResponseHelper,
  SendFriendRequestRequest,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FriendshipService } from '../services/friendship.service';

export class FriendshipController {
  static async getFriends(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetFriendsRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getUserFriends(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async removeFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id, friendId } = request.params as RemoveFriendRequest;

    const user_id = parseInt(id);
    const friend_id = parseInt(friendId);
    const result = await FriendshipService.removeFriend(user_id, friend_id);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async getRequests(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetRequestsRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getIncomingFriendRequests(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async sendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { id, recipientId } = request.params as SendFriendRequestRequest;
    const user_id = parseInt(id);
    const recipient_id = parseInt(recipientId);

    const result = await FriendshipService.sendFriendRequest(user_id, recipient_id);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async acceptFriend(request: FastifyRequest, reply: FastifyReply) {
    const { requestId } = request.params as AcceptFriendRequest;
    const friendRequestId = parseInt(requestId);

    const result = await FriendshipService.acceptFriend(friendRequestId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async declineFriend(request: FastifyRequest, reply: FastifyReply) {
    const { requestId } = request.params as DeclineFriendRequest;
    const friendRequestId = parseInt(requestId);

    const result = await FriendshipService.declineFriend(friendRequestId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async checkFriendshipExists(request: FastifyRequest, reply: FastifyReply) {
    const { id1, id2 } = request.params as CheckFriendshipExistsRequest;

    const userId1 = parseInt(id1);
    const userId2 = parseInt(id2);
    const result = await FriendshipService.checkFriendshipExists(userId1, userId2);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
