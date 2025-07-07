import {
  CreateScoreRequest,
  DatabaseHelper,
  DatabaseResult,
  DB_ERROR_CODES,
  GetScoresQuery,
  Score,
  Stats,
} from '@transcenders/contracts';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { getDB } from '../db/database';

export class ScoreService {
  // Private logic methods for internal use

  private static async getScoreByIdLogic(database: Database, id: number): Promise<Score | null> {
    const sql = SQL`
      SELECT * FROM scores WHERE id = ${id}
    `;
    const score = await database.get(sql.text, sql.values);
    return score ? (score as Score) : null;
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
    let tourament_game_wins = 0;
    let tournament_game_win_percentage = 0;
    let tournament_wins = 0;
    let total_score = 0;
    let total_duration = 0;
    let average_score = 0;
    let average_duration = 0;

    for (const score of scores) {
      total_games++;
      total_duration += score.game_duration;
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
          }
          tourament_game_wins++;
        }
      } else {
        total_score += score.loser_score;
      }
    }

    if (total_games > 0) {
      total_win_percentage = (total_wins / total_games) * 100;
      if (regular_games > 0) {
        regular_game_win_percentage = (regular_game_wins / regular_games) * 100;
      }
      if (tournament_games > 0) {
        tournament_game_win_percentage = (tourament_game_wins / tournament_games) * 100;
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
      tournament_games,
      tourament_game_wins,
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
    const sql = SQL`
        INSERT INTO scores (winner_id, loser_id, winner_score, loser_score, tournament_level, game_duration, game_start, game_end)
        VALUES (${scoreData.winner_id}, ${scoreData.loser_id}, 
        ${scoreData.winner_score}, ${scoreData.loser_score}, ${scoreData.tournament_level}, ${scoreData.game_duration}, 
        ${scoreData.game_start}, ${scoreData.game_end})
      `;

    const result = await database.run(sql.text, sql.values);
    if (!result.lastID) {
      throw new Error('Failed to create score');
    }

    const score = await this.getScoreByIdLogic(database, result.lastID);
    if (!score) {
      throw new Error('Score created but not found');
    }

    return score;
  }

  // Public API methods using DatabaseHelper

  static async getAllScores(query: GetScoresQuery): Promise<DatabaseResult<Score[]>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Score[]>('get all scores', db, async (database) => {
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

  static async createScore(scoreData: CreateScoreRequest): Promise<DatabaseResult<Score>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Score>('create score', db, async (database) => {
      return await this.createScoreLogic(database, scoreData);
    });
  }

  // TODO Add query string support for limit and offset to implement pagination support
  static async getScoresById(id: number): Promise<DatabaseResult<Score[]>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Score[]>('get scores by id', db, async (database) => {
      const scores = await this.getScoresByIdLogic(database, id);
      if (!scores) {
        const error = new Error(`no games found for user id '${id}'`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return scores as Score[];
    });
  }

  static async getStatsById(id: number): Promise<DatabaseResult<Stats>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Stats>('get stats by id', db, async (database) => {
      const stats = await this.getStatsByIdLogic(database, id);
      if (!stats) {
        const error = new Error(`no games found for user id '${id}'`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return stats as Stats;
    });
  }
}
