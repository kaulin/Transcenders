import {
  CreateMatchRequest,
  CreateScoreRequest,
  ERROR_CODES,
  GetScoresQuery,
  Match,
  ResultHelper,
  Score,
  ServiceError,
  ServiceResult,
  Stats,
} from '@transcenders/contracts';
import { DatabaseManager } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';

export class ScoreService {
  // Private logic methods for internal use
  private static async getScoreByIdLogic(database: Database, id: number): Promise<Score | null> {
    const sql = SQL`
      SELECT * FROM scores WHERE id = ${id}
    `;
    const score = await database.get(sql.text, sql.values);
    return score ? (score as Score) : null;
  }

  private static async getMatchByIdLogic(database: Database, id: string): Promise<Match | null> {
    const sql = SQL`
      SELECT * FROM matches WHERE id = ${id}
    `;
    const result = await database.get(sql.text, sql.values);
    return result ? (result as Match) : null;
  }

  private static async getScoresByIdLogic(database: Database, id: number): Promise<Score[]> {
    const sql = SQL`
      SELECT * FROM scores WHERE winner_id = ${id} OR loser_id = ${id}
    `;
    sql.append(SQL` ORDER BY game_end DESC`);
    const userScores = await database.all(sql.text, sql.values);
    return userScores as Score[];
  }

  private static async calculateStats(scores: Score[], id: number): Promise<Stats> {
    let total_games = 0;
    let total_wins = 0;
    let total_win_percentage = 0;
    let regular_games = 0;
    let regular_game_wins = 0;
    let regular_game_win_percentage = 0;
    let tournament_games = 0;
    let tournament_game_wins = 0;
    let tournament_game_win_percentage = 0;
    let tournament_wins = 0;
    let total_score = 0;
    let total_duration = 0;
    let average_score = 0;
    let average_duration = 0;
    let tournaments_joined = 0;
    let tournament_golds = 0;
    let tournament_silvers = 0;

    for (const score of scores) {
      total_games++;
      total_duration += score.game_duration;
      if (score.tournament_level >= 2) tournaments_joined++;
      if (score.tournament_level === 0) regular_games++;
      else tournament_games++;
      if (id === score.winner_id) {
        total_wins++;
        total_score += score.winner_score;
        if (score.tournament_level === 0) {
          regular_game_wins++;
        } else {
          if (score.tournament_level === 1) {
            tournament_wins++;
            tournament_golds++;
          }
          tournament_game_wins++;
        }
      } else {
        if (score.tournament_level === 1) tournament_silvers++;
        total_score += score.loser_score;
      }
    }

    if (total_games > 0) {
      total_win_percentage = (total_wins / total_games) * 100;
      if (regular_games > 0) {
        regular_game_win_percentage = (regular_game_wins / regular_games) * 100;
      }
      if (tournament_games > 0) {
        tournament_game_win_percentage = (tournament_game_wins / tournament_games) * 100;
      }
      average_score = total_score / total_games;
      average_duration = total_duration / total_games;
    }

    return {
      total_games,
      total_wins,
      total_win_percentage,
      regular_games,
      regular_game_wins,
      regular_game_win_percentage,
      tournaments_joined,
      tournament_golds,
      tournament_silvers,
      tournament_games,
      tournament_game_wins,
      tournament_game_win_percentage,
      tournament_wins,
      total_score,
      average_score,
      total_duration,
      average_duration,
    } as Stats;
  }

  private static async getStatsByIdLogic(database: Database, id: number): Promise<Stats> {
    const scores = await this.getScoresByIdLogic(database, id);
    const stats = await this.calculateStats(scores, id);
    return stats;
  }

  private static async createScoreLogic(
    database: Database,
    scoreData: CreateScoreRequest,
  ): Promise<Score> {
    const {
      match_id,
      winner_score,
      loser_score,
      winner_id,
      loser_id,
      game_start,
      game_end,
      game_duration,
      tournament_level,
    } = scoreData;

    if (match_id == undefined) {
      throw new ServiceError(ERROR_CODES.SCORE.NO_MATCH_PROVIDED, {
        scoreData: scoreData,
      });
    }

    if (winner_id === loser_id && !(winner_id === 0 && loser_id === 0)) {
      throw new ServiceError(ERROR_CODES.SCORE.DUPLICATE_PLAYER_ID, {
        scoreData: scoreData,
      });
    }

    if (winner_score != 3 || loser_score < 0 || loser_score >= 3) {
      throw new ServiceError(ERROR_CODES.SCORE.INVALID_SCORE_VALUE, {
        scoreData: scoreData,
      });
    }

    const start_time = new Date(game_start).getTime();
    const end_time = new Date(game_end).getTime();

    if (isNaN(start_time) || isNaN(end_time)) {
      throw new ServiceError(ERROR_CODES.SCORE.INVALID_TIMESTAMP_VALUE, {
        scoreData: scoreData,
      });
    }

    if (start_time >= end_time) {
      throw new ServiceError(ERROR_CODES.SCORE.END_BEFORE_START, {
        scoreData: scoreData,
      });
    }

    const expectedDuration = end_time - start_time;
    if (game_duration !== expectedDuration) {
      throw new ServiceError(ERROR_CODES.SCORE.INVALID_DURATION_VALUE, {
        scoreData: scoreData,
      });
    }

    if (tournament_level < 0 || tournament_level > 2) {
      throw new ServiceError(ERROR_CODES.SCORE.INVALID_TOURNAMENT_LEVEL, {
        scoreData: scoreData,
      });
    }

    const matchData = await this.getMatchByIdLogic(database, match_id);

    if (!matchData) {
      throw new ServiceError(ERROR_CODES.SCORE.INVALID_MATCH_ID, {
        scoreData: scoreData,
      });
    }

    if (
      (matchData.player1_id != winner_id && matchData.player1_id != loser_id) ||
      (matchData.player2_id != winner_id && matchData.player2_id != loser_id) ||
      matchData.start_time != game_start
    ) {
      throw new ServiceError(ERROR_CODES.SCORE.SCORE_MATCH_DISCREPANCY, {
        scoreData: scoreData,
      });
    }

    const sql = SQL`
        INSERT INTO scores (winner_id, loser_id, winner_score, loser_score, tournament_level, game_duration, game_start, game_end)
        VALUES (${winner_id}, ${loser_id}, 
        ${winner_score}, ${loser_score}, ${tournament_level}, ${game_duration}, 
        ${game_start}, ${game_end})
      `;

    const result = await database.run(sql.text, sql.values);
    if (!result.lastID) {
      throw new ServiceError(ERROR_CODES.SCORE.SCORE_CREATION_FAILED, {
        scoreData: scoreData,
      });
    }

    // TODO: Remove match entry for added score

    return {
      id: result.lastID,
      ...scoreData,
    } as Score;
  }

  private static async createMatchLogic(
    database: Database,
    matchData: CreateMatchRequest,
  ): Promise<Match> {
    const { player1_id, player2_id, start_time } = matchData;

    if (player1_id === player2_id && !(player1_id === 0 && player2_id === 0)) {
      throw new ServiceError(ERROR_CODES.SCORE.DUPLICATE_PLAYER_ID, {
        matchData: matchData,
      });
    }

    const match_id = crypto.randomUUID();

    const sql = SQL`
        INSERT INTO matches (match_id, player1_id, player2_id, start_time, tournament_level, game_duration, game_start, game_end)
        VALUES (${match_id}, ${player1_id}, 
        ${player2_id}, ${start_time})
      `;

    const result = await database.run(sql.text, sql.values);
    if (!result.lastID) {
      throw new ServiceError(ERROR_CODES.SCORE.MATCH_CREATION_FAILED, {
        matchData: matchData,
      });
    }
    return {
      id: result.lastID,
      ...matchData,
    } as Match;
  }

  // Public API methods using ResultHelper

  static async getAllScores(query: GetScoresQuery): Promise<ServiceResult<Score[]>> {
    const db = await DatabaseManager.for('SCORE').open();
    return ResultHelper.executeQuery<Score[]>('get all scores', db, async (database) => {
      const sql = SQL`SELECT * FROM scores`;
      if (query.search) {
        const searchTerm = `%${query.search}%`;
        sql.append(SQL` WHERE winner_id LIKE ${searchTerm} OR loser_id LIKE ${searchTerm}`);
      }

      sql.append(SQL` ORDER BY created_at DESC`);
      const result = await database.all(sql.text, sql.values);
      return result as Score[];
    });
  }

  static async createScore(scoreData: CreateScoreRequest): Promise<ServiceResult<Score>> {
    const db = await DatabaseManager.for('SCORE').open();
    return ResultHelper.executeQuery<Score>('create score', db, async (database) => {
      return await this.createScoreLogic(database, scoreData);
    });
  }

  static async createMatch(matchData: CreateMatchRequest): Promise<ServiceResult<Match>> {
    const db = await DatabaseManager.for('SCORE').open();
    return ResultHelper.executeQuery<Match>('create match', db, async (database) => {
      return await this.createMatchLogic(database, matchData);
    });
  }

  // TODO Add query string support for limit and offset to implement pagination support
  static async getScoresById(id: number): Promise<ServiceResult<Score[]>> {
    const db = await DatabaseManager.for('SCORE').open();
    return ResultHelper.executeQuery<Score[]>('get scores by id', db, async (database) => {
      const scores = await this.getScoresByIdLogic(database, id);
      return scores as Score[];
    });
  }

  static async getStatsById(id: number): Promise<ServiceResult<Stats>> {
    const db = await DatabaseManager.for('SCORE').open();
    return ResultHelper.executeQuery<Stats>('get stats by id', db, async (database) => {
      const stats = await this.getStatsByIdLogic(database, id);
      return stats as Stats;
    });
  }
}
