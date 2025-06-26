import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/gateway.service';

const SCORE_URL = process.env.SCORE_SERVICE_URL ?? 'http://localhost:3003';

export class ScoreController {
  static async getScores(req: FastifyRequest, reply: FastifyReply) {
    return GatewayService.forwardAndReply(req, reply, SCORE_URL, '/score');
  }

  static async addScore(req: FastifyRequest, reply: FastifyReply) {
    return GatewayService.forwardAndReply(req, reply, SCORE_URL, '/score');
  }

  static async getScoresById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}`;
    return GatewayService.forwardAndReply(req, reply, SCORE_URL, path);
  }

  static async getStatsById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}/stats`;
    return GatewayService.forwardAndReply(req, reply, SCORE_URL, path);
  }
}