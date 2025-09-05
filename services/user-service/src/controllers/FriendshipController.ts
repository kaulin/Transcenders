import {
  AcceptFriendRequestRequest,
  DeclineFriendRequestRequest,
  GetFriendsRequest,
  GetRequestsRequest,
  RelationshipStatusRequest,
  RemoveFriendRequest,
  SendFriendRequestRequest,
} from '@transcenders/contracts';
import { ApiErrorHandler } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FriendshipService } from '../services/FriendshipService.js';

export class FriendshipController {
  static async getFriends(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetFriendsRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getUserFriends(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async removeFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id, friendId } = request.params as RemoveFriendRequest;

    const user_id = parseInt(id);
    const friend_id = parseInt(friendId);
    const result = await FriendshipService.removeFriend(user_id, friend_id);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getIncomingRequests(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetRequestsRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getIncomingFriendRequests(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getOutgoingRequests(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetRequestsRequest;
    const userId = parseInt(id);

    const result = await FriendshipService.getOutgoingFriendRequests(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async sendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { id, targetUserId } = request.params as SendFriendRequestRequest;
    const user_id = parseInt(id);
    const target_id = parseInt(targetUserId);

    const result = await FriendshipService.sendFriendRequest(user_id, target_id);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async acceptFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id, requestingUserId } = request.params as AcceptFriendRequestRequest;
    const recipient_id = parseInt(id);
    const requesting_id = parseInt(requestingUserId);

    const result = await FriendshipService.acceptFriendByUserIds(recipient_id, requesting_id);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async declineFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id, requestingUserId } = request.params as DeclineFriendRequestRequest;
    const recipient_id = parseInt(id);
    const requesting_id = parseInt(requestingUserId);

    const result = await FriendshipService.declineFriendByUserIds(recipient_id, requesting_id);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getRelationshipStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id, targetUserId } = request.params as RelationshipStatusRequest;
    const userId = parseInt(id);
    const targetId = parseInt(targetUserId);

    const result = await FriendshipService.getRelationshipStatus(userId, targetId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
