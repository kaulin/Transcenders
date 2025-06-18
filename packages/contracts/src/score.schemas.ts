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
export const TotalGamesField = Type.Number();
export const TotalWinsField = Type.Number();
export const TotalWinPercentageField = Type.Number();
export const RegularGamesField = Type.Number();
export const RegularGameWinsField = Type.Number();
export const RegularGameWinPercentageField = Type.Number();
export const TournamentGamesField = Type.Number();
export const TournamentGameWinsField = Type.Number();
export const TournamentGameWinPercentageField = Type.Number();
export const TournamentWinsField = Type.Number();
export const TotalScoreField = Type.Number();
export const AverageScoreField = Type.Number();
export const TotalDurationField = Type.Number();
export const AverageDurationField = Type.Number();

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

export const StatsSchema = Type.Object({
  total_games: TotalGamesField,
  total_wins: TotalWinsField,
  total_win_percentage: TotalWinPercentageField,
  regular_games: RegularGamesField,
  regular_game_wins: RegularGameWinsField,
  regular_game_win_percentage: RegularGameWinPercentageField,
  tournament_games: TournamentGamesField,
  tourament_game_wins: TournamentWinsField,
  tournament_game_win_percentage: TournamentGameWinPercentageField,
  tournament_wins: TournamentWinsField,
  total_score: TotalScoreField,
  average_score: AverageScoreField,
  total_duration: TotalDurationField,
  average_duration: AverageDurationField
});
export type Stats = Static<typeof StatsSchema>;

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
export type ScoresByIdRequest = Static<typeof scoresByIdSchema.params>;

export const statsByIdSchema = {
  params: Type.Object({
    id: ScoresByIdField,
  }),
};
export type StatsByIdRequest = Static<typeof statsByIdSchema.params>;