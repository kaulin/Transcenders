import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/GatewayService';

const USER_URL = process.env.USER_SERVICE_URL ?? 'http://localhost:3001';

export class UserController {

  // User routes

  static async getUsers(req: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(USER_URL, req, reply, '/users');
  }

  static async addUser(req: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(USER_URL, req, reply, '/users');
  }

  static async getUserById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async updateUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async deleteUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/users/${req.params.id}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async checkUserExists(req: FastifyRequest<{ Params: { identifier: string } }>, reply: FastifyReply) {
    const path = `/users/check/${req.params.identifier}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async getUserExact(req: FastifyRequest, reply: FastifyReply) {
    await GatewayService.forwardAndReply(USER_URL, req, reply, '/users/exact');
  }

  // Friendship routes

  static async getFriends(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/friends/${req.params.id}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async removeFriend(req: FastifyRequest<{ Params: { id: string, friendId: string } }>, reply: FastifyReply) {
    const path = `/friends/${req.params.id}/${req.params.friendId}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async getRequests(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/friends/requests/${req.params.id}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async sendRequest(req: FastifyRequest<{ Params: { id: string, recipientId: string } }>, reply: FastifyReply) {
    const path = `/friends/request/${req.params.id}/${req.params.recipientId}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async acceptFriend(req: FastifyRequest<{ Params: { requestId: string } }>, reply: FastifyReply) {
    const path = `/friends/accept/${req.params.requestId}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async declineFriend(req: FastifyRequest<{ Params: { requestId: string } }>, reply: FastifyReply) {
    const path = `/friends/decline/${req.params.requestId}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }

  static async checkFriendshipExists(req: FastifyRequest<{ Params: { id1: string, id2: string } }>, reply: FastifyReply) {
    const path = `/friends/exists/${req.params.id1}/${req.params.id2}`;
    await GatewayService.forwardAndReply(USER_URL, req, reply, path);
  }
}