import { Static, Type } from '@sinclair/typebox';
import { TimestampField, UserIdField } from './user.schemas.js';

/**
 * ENTITY SCHEMAS
 */
// #TODO naming consistency, PascalCase for types, camelCase for schemas for all schemas
export const ScoreSchema = Type.Object({
  id: Type.Optional(Type.Number()),
  winner_id: UserIdField,
  loser_id: UserIdField,
  winner_score: Type.Number(),
  loser_score: Type.Number(),
  tournament_level: Type.Number(),
  game_duration: Type.Number(),
  game_start: TimestampField,
  game_end: TimestampField,
});

export const scoreArraySchema = Type.Array(ScoreSchema);
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

/**
 * REQUEST SCHEMAS
 */
export const createScoreSchema = {
  body: ScoreSchema,
};
export type CreateScoreRequest = Static<typeof createScoreSchema.body>;

export const getScoresSchema = {
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    offset: Type.Optional(Type.Number({ minimum: 0 })),
  }),
};
export type GetScoresQuery = Static<typeof getScoresSchema.querystring>;

export const getScoreSchema = {
  querystring: Type.Object(
    {
      winner_id: Type.Optional(Type.Number()),
      loser_id: Type.Optional(Type.Number()),
    },
    {
      minProperties: 1,
      additionalProperties: false,
    },
  ),
};
export type GetScoreRequest = Static<typeof getScoreSchema.querystring>;

export const scoresByIdSchema = {
  params: Type.Object({
    id: UserIdField,
  }),
};
export type ScoresByIdRequest = Static<typeof scoresByIdSchema.params>;

export const statsByIdSchema = {
  params: Type.Object({
    id: UserIdField,
  }),
};
export type StatsByIdRequest = Static<typeof statsByIdSchema.params>;
