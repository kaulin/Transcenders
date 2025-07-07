import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from '../services/gateway.service';
import { SERVICE_URLS } from '../urls';

export class ScoreController {
  static async getScores(req: FastifyRequest, reply: FastifyReply) {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const path = queryString ? `/score?${queryString}` : '/score';
    return GatewayService.forwardAndReply(req, reply, SERVICE_URLS.SCORE, path);
  }

  static async addScore(req: FastifyRequest, reply: FastifyReply) {
    const path = `/score`;
    return GatewayService.forwardAndReply(req, reply, SERVICE_URLS.SCORE, path);
  }

  static async getScoresById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}`;
    return GatewayService.forwardAndReply(req, reply, SERVICE_URLS.SCORE, path);
  }

  static async getStatsById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const path = `/score/${req.params.id}/stats`;
    return GatewayService.forwardAndReply(req, reply, SERVICE_URLS.SCORE, path);
  }
}
