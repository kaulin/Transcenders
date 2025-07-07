import { Static, Type } from '@sinclair/typebox';
import { standardApiResponses } from './api.schemas';
import { TimestampField, UserIdField } from './user.schemas';

// ENTITY SCHEMAS
export const ScoreSchema = Type.Object({
  winner_id: UserIdField,
  loser_id: UserIdField,
  winner_score: Type.Number(),
  loser_score: Type.Number(),
  tournament_level: Type.Number(),
  game_duration: Type.Number(),
  game_start: TimestampField,
  game_end: TimestampField,
});
export type Score = Static<typeof ScoreSchema>;

export const ScoresArraySchema = Type.Array(ScoreSchema);
export type ScoresArray = Static<typeof ScoresArraySchema>;

export const StatsSchema = Type.Object({
  total_games: Type.Number(),
  total_wins: Type.Number(),
  total_win_percentage: Type.Number(),
  regular_games: Type.Number(),
  regular_game_wins: Type.Number(),
  regular_game_win_percentage: Type.Number(),
  tournament_games: Type.Number(),
  tourament_game_wins: Type.Number(),
  tournament_game_win_percentage: Type.Number(),
  tournament_wins: Type.Number(),
  total_score: Type.Number(),
  average_score: Type.Number(),
  total_duration: Type.Number(),
  average_duration: Type.Number(),
});
export type Stats = Static<typeof StatsSchema>;

// ROUTE SCHEMAS
export const scoreRouteSchemas = {
  getScores: {
    description: 'List scores (with optional query params: ?search=, ?limit=, ?offset=)',
    tags: ['Score'],
    querystring: Type.Object({
      search: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
      offset: Type.Optional(Type.Number({ minimum: 0 })),
    }),
    response: standardApiResponses,
  },

  addScore: {
    description: 'Add new score entry',
    tags: ['Score'],
    body: Type.Object({
      winner_id: UserIdField,
      loser_id: UserIdField,
      winner_score: Type.Number(),
      loser_score: Type.Number(),
      tournament_level: Type.Number(),
      game_duration: Type.Number(),
      game_start: TimestampField,
      game_end: TimestampField,
    }),
    response: standardApiResponses,
  },

  getScoresById: {
    description: 'Get score data by user ID',
    tags: ['Score'],
    params: Type.Object({
      id: UserIdField,
    }),
    response: standardApiResponses,
  },

  getStatsById: {
    description: 'Get user stats by user ID',
    tags: ['Score'],
    params: Type.Object({
      id: UserIdField,
    }),
    response: standardApiResponses,
  },
} as const;

// REQUEST TYPES
export type GetScoresQuery = Static<typeof scoreRouteSchemas.getScores.querystring>;
export type CreateScoreRequest = Static<typeof scoreRouteSchemas.addScore.body>;
export type ScoresByIdRequest = Static<typeof scoreRouteSchemas.getScoresById.params>;
export type StatsByIdRequest = Static<typeof scoreRouteSchemas.getStatsById.params>;
