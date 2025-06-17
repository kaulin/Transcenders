import {
  CreateScoreRequest,
  DatabaseHelper,
  DatabaseResult,
  DB_ERROR_CODES,
  GetScoresQuery,
  Score,
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

  private static async getScoresByIdLogic(database: Database, id: number): Promise<Score[] | null> {
    const sql = SQL`
      SELECT * FROM scores WHERE winner_id = ${id} OR loser_id = ${id}
    `;
    sql.append(SQL` ORDER BY created_at DESC`);
    const userScores = await database.all(sql.text, sql.values);
    return userScores as Score[];
  }

  private static async createScoreLogic(database: Database, scoreData: CreateScoreRequest, ): Promise<Score> {
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
      throw new Error('User created but not found');
    }

    return score;
  }

  // Public API methods using DatabaseHelper

  static async getAllScores(query: GetScoresQuery): Promise<DatabaseResult<Score[]>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Score[]>('get all users', db, async (database) => {
      const sql = SQL`SELECT * FROM scores`;
      if (query.search) {
        const searchTerm = `%${query.search}%`;
        sql.append(
          SQL` WHERE winner_id LIKE ${searchTerm} OR loser_id LIKE ${searchTerm}`,
        );
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

  static async getScoresById(id: number): Promise<DatabaseResult<Score[]>> {
    const db = await getDB();
    return DatabaseHelper.executeQuery<Score[]>('get user', db, async (database) => {
      const scores = await this.getScoresByIdLogic(database, id);
      if (!scores) {
        const error = new Error(`no games found for user id '${id}'`);
        (error as any).code = DB_ERROR_CODES.RECORD_NOT_FOUND;
        throw error;
      }
      return scores as Score[];
    });
  }

}
