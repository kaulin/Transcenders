import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/gateway.service';

const USER_URL = process.env.USER_SERVICE_URL ?? 'http://localhost:3001';

export class UserController {

  // User routes

  static async getUsers(req: FastifyRequest, reply: FastifyReply) {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const path = queryString ? `/users?${queryString}` : '/users';
    await GatewayService.forwardAndReply(req, reply, USER_URL, '/users');
  }

  static async addUser(req: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(req, reply, USER_URL, '/users');
  }

  static async getUserById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async updateUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async deleteUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async checkUserExists(req: FastifyRequest<{ Params: { identifier: string } }>, reply: FastifyReply) {
    const path = `/users/check/${req.params.identifier}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async getUserExact(req: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(req, reply, USER_URL, '/users/exact');
  }

  // Friendship routes

  static async getFriends(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/friends/${req.params.id}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async removeFriend(req: FastifyRequest<{ Params: { id: string, friendId: string } }>, reply: FastifyReply) {
    const path = `/friends/${req.params.id}/${req.params.friendId}`;  
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async getRequests(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/friends/requests/${req.params.id}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async sendRequest(req: FastifyRequest<{ Params: { id: string, recipientId: string } }>, reply: FastifyReply) {
    const path = `/friends/request/${req.params.id}/${req.params.recipientId}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async acceptFriend(req: FastifyRequest<{ Params: { requestId: string } }>, reply: FastifyReply) {
    const path = `/friends/accept/${req.params.requestId}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async declineFriend(req: FastifyRequest<{ Params: { requestId: string } }>, reply: FastifyReply) {
    const path = `/friends/decline/${req.params.requestId}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }

  static async checkFriendshipExists(req: FastifyRequest<{ Params: { id1: string, id2: string } }>, reply: FastifyReply) {
    const path = `/friends/exists/${req.params.id1}/${req.params.id2}`;
    await GatewayService.forwardAndReply(req, reply, USER_URL, path);
  }
}