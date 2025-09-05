import {
  createMatchSchema,
  createScoreSchema,
  getScoresSchema,
  SCORE_ROUTES,
  scoresByIdSchema,
  standardApiResponses,
  statsByIdSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { ScoreController } from '../controllers/ScoreController.js';

/**
 * SWAGGER
 * localhost:3003/docs
 */
export async function registerScoreRoutes(app: FastifyInstance) {
  app.get(
    SCORE_ROUTES.SCORES,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'List scores (with optional query params: ?id=, ?limit=, ?offset=)',
        tags: ['Score'],
        querystring: getScoresSchema.querystring,
        response: standardApiResponses,
      },
    },
    ScoreController.getScores,
  );

  app.post(
    SCORE_ROUTES.SCORE,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Add new score entry',
        tags: ['Score'],
        body: createScoreSchema.body,
        response: standardApiResponses,
      },
    },
    ScoreController.addScore,
  );

  app.post(
    SCORE_ROUTES.MATCH,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Add new match entry',
        tags: ['Score'],
        body: createMatchSchema.body,
        response: standardApiResponses,
      },
    },
    ScoreController.addMatch,
  );

  app.get(
    SCORE_ROUTES.SCORES_BY_ID,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get score data by user ID',
        tags: ['Score'],
        params: scoresByIdSchema.params,
        response: standardApiResponses,
      },
    },
    ScoreController.getScoresById,
  );

  app.get(
    SCORE_ROUTES.STATS_BY_ID,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get user stats by user ID',
        tags: ['Score'],
        params: statsByIdSchema.params,
        response: standardApiResponses,
      },
    },
    ScoreController.getStatsById,
  );
}
