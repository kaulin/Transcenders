import { FastifyInstance } from 'fastify';
import { ScoreController } from '../controllers/score.controller';

export default async function scoreRoutes(fastify: FastifyInstance) {
  fastify.get('/score', ScoreController.getScores);
  fastify.post('/score', ScoreController.addScore);
  fastify.get('/score/:id', ScoreController.getScoresById);
  fastify.get('/score/:id/stats', ScoreController.getStatsById);
}