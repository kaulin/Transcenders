import {
  FriendRequestsData,
  ParamsIdRequest,
  RemoveFriendRequest,
  RequestFriendRequest,
  User,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FriendshipService } from '../services/FriendshipService';
import { ResponseHelper } from '../utils/responseHelper';

export class FriendshipController {
  static async getFriends(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const userId = parseInt(id);

    const friends: User[] = await FriendshipService.getFriends(userId);
    return ResponseHelper.success(reply, friends);
  }

  static async sendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { initiator_id, recipient_id } = request.body as RequestFriendRequest;

    const success: boolean = await FriendshipService.sendRequest(initiator_id, recipient_id);
    return ResponseHelper.success(reply, { success });
  }

  static async getIncomingFriendRequests(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const userId = parseInt(id);

    const requests: FriendRequestsData[] = await FriendshipService.getIncomingFriendRequests(
      userId,
    );
    return ResponseHelper.success(reply, requests);
  }

  static async acceptFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const friendRequestId = parseInt(id);

    const success: boolean = await FriendshipService.acceptFriend(friendRequestId);
    return ResponseHelper.success(reply, success);
  }

  static async declineFriend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsIdRequest;
    const friendRequestId = parseInt(id);

    const success: boolean = await FriendshipService.declineFriend(friendRequestId);
    return ResponseHelper.success(reply, success);
  }

  static async removeFriend(request: FastifyRequest, reply: FastifyReply) {
    const { user_1, user_2 } = request.body as RemoveFriendRequest;

    const success: boolean = await FriendshipService.removeFriend(user_1, user_2);
    return ResponseHelper.success(reply, success);
  }
}
