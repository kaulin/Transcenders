import {
  CreateMatchRequest,
  CreateScoreRequest,
  GetScoresQuery,
  ScoresByIdRequest,
  StatsByIdRequest,
} from '@transcenders/contracts';
import { ApiErrorHandler } from '@transcenders/server-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ScoreService } from '../services/ScoreService.js';

export class ScoreController {
  // ScoreController
  static async getScores(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as GetScoresQuery;

    const result = await ScoreService.getAllScores(query);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async addScore(request: FastifyRequest, reply: FastifyReply) {
    const scoredata = request.body as CreateScoreRequest;

    const result = await ScoreService.createScore(scoredata);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async addMatch(request: FastifyRequest, reply: FastifyReply) {
    const matchdata = request.body as CreateMatchRequest;

    const result = await ScoreService.createMatch(matchdata);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getScoresById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ScoresByIdRequest;
    const userId = id;

    const result = await ScoreService.getScoresById(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }

  static async getStatsById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as StatsByIdRequest;
    const userId = id;

    const result = await ScoreService.getStatsById(userId);
    return ApiErrorHandler.handleServiceResult(reply, result);
  }
}
