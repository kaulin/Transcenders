import { Static, TSchema } from '@sinclair/typebox';
import {
  CreateScoreRequest,
  GetScoresQuery,
  SCORE_ROUTES,
  scoreArraySchema,
  ScoreSchema,
  StatsSchema,
  SERVICE_URLS,
  toQueryString,
} from '@transcenders/contracts';
import { TypedApiClient } from '../api/TypedApiClient.js';
import { ApiCallOptions } from '../types/client.options.js';

export class ScoreApiClient extends TypedApiClient {
  /**
   * Internal method to call the score service
   */
  private static async callScoreService<T extends TSchema>(
    endpoint: string,
    schema: T,
    options: ApiCallOptions = {},
  ): Promise<Static<T>> {
    const url = `${SERVICE_URLS.SCORE}${endpoint}`;
    return this.callTyped(url, schema, options);
  }

  /**
   * Gets a list of scores based on optional query parameters
   */
  static async getScores(query?: GetScoresQuery) {
    const queryString = query ? toQueryString(query) : '';
    const endpoint = `${SCORE_ROUTES.SCORES}${queryString}`;
    return this.callScoreService(endpoint, scoreArraySchema);
  }

  /**
   * Creates a new score
   */
  static async createScore(scoreData: CreateScoreRequest) {
    const endpoint = SCORE_ROUTES.SCORES;
    const options: ApiCallOptions = { method: 'POST', body: scoreData };
    return this.callScoreService(endpoint, ScoreSchema, options);
  }

  /**
   * Gets scores by user by their ID
   */
  static async getScoresForUser(userId: number) {
    const endpoint = SCORE_ROUTES.SCORES_BY_ID.replace(':id', userId.toString());
    return this.callScoreService(endpoint, scoreArraySchema);
  }

  /**
   * Gets scores by user by their ID
   */
  static async getStatsForUser(userId: number) {
    const endpoint = SCORE_ROUTES.STATS_BY_ID.replace(':id', userId.toString());
    return this.callScoreService(endpoint, StatsSchema);
  }
}
