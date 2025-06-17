import { Static, Type } from '@sinclair/typebox';
export const WinnerIdField = Type.Number();
export const LoserIdField = Type.Number();
export const WinnerScoreField = Type.Number();
export const LoserScoreField = Type.Number();
export const TournamentLevelField = Type.Number();
export const GameDurationField = Type.Number();
export const GameStartTimeField = Type.Number();
export const GameEndTimeField = Type.Number();
export const ScoresByIdField = Type.Number();

/**
 * ENTITY SCHEMAS
 */
export const ScoreSchema = Type.Object({
  winner_id: WinnerIdField,
  loser_id: LoserIdField,
  winner_score: WinnerScoreField,
  loser_score: LoserScoreField,
  tournament_level: TournamentLevelField,
  game_duration: GameDurationField,
  game_start: GameStartTimeField,
  game_end: GameEndTimeField,
});
export type Score = Static<typeof ScoreSchema>;

export const ScoresArraySchema = Type.Array(ScoreSchema);
export type ScoresArray = Static<typeof ScoresArraySchema>;

/**
 * REQUEST SCHEMAS
 */
export const createScoreSchema = {
  body: Type.Object({
    winner_id: WinnerIdField,
    loser_id: LoserIdField,
    winner_score: WinnerScoreField,
    loser_score: LoserScoreField,
    tournament_level: TournamentLevelField,
    game_duration: GameDurationField,
    game_start: GameStartTimeField,
    game_end: GameEndTimeField,
  }),
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
	id: ScoresByIdField,
  }),
};
export type scoresByIdRequest = Static<typeof scoresByIdSchema.params>;