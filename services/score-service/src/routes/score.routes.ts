import { FastifyInstance } from 'fastify';
import { SCORE_ROUTES, scoreRouteSchemas } from '@transcenders/contracts';
import { ScoreController } from '../controllers/score.controller';

/**
 * SWAGGER
 * localhost:3003/docs
 */
export default async function scoreRoutes(fastify: FastifyInstance) {
  fastify.get(
    SCORE_ROUTES.SCORES,
    {
      schema: scoreRouteSchemas.getScores,
    },
    ScoreController.getScores,
  );
  fastify.post(
    SCORE_ROUTES.SCORE,
    {
      schema: scoreRouteSchemas.addScore,
    },
    ScoreController.addScore,
  );
  fastify.get(
    SCORE_ROUTES.SCORES_BY_ID,
    {
      schema: scoreRouteSchemas.getScoresById,
    },
    ScoreController.getScoresById,
  );
  fastify.get(
    SCORE_ROUTES.STATS_BY_ID,
    {
      schema: scoreRouteSchemas.getStatsById,
    },
    ScoreController.getStatsById,
  );
}
