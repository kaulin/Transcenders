import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/GatewayService';

const SCORE_URL = process.env.SCORE_SERVICE_URL ?? 'http://localhost:3003';

export class ScoreController {
  static async getScores(req: FastifyRequest, reply: FastifyReply) {
    return GatewayService.forwardAndReply(SCORE_URL, req, reply, '/score');
  }

  static async addScore(req: FastifyRequest, reply: FastifyReply) {
    return GatewayService.forwardAndReply(SCORE_URL, req, reply, '/score');
  }

  static async getScoresById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}`;
    return GatewayService.forwardAndReply(SCORE_URL, req, reply, path);
  }

  static async getStatsById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}/stats`;
    return GatewayService.forwardAndReply(SCORE_URL, req, reply, path);
  }
}