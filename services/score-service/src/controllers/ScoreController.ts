import {
  CreateScoreRequest,
  GetScoresQuery,
  ResponseHelper,
  ScoresByIdRequest,
} from '@transcenders/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ScoreService } from '../services/ScoreService';

export class ScoreController {
  // ScoreController
  static async getScores(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as GetScoresQuery;

    const result = await ScoreService.getAllScores(query);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async addScore(request: FastifyRequest, reply: FastifyReply) {
    const scoredata = request.body as CreateScoreRequest;

    const result = await ScoreService.createScore(scoredata);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }

  static async getScoresById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ScoresByIdRequest;
    const userId = parseInt(id);

    const result = await ScoreService.getScoresById(userId);
    return ResponseHelper.handleDatabaseResult(reply, result);
  }
}
