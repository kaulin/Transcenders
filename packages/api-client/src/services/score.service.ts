import {
  ApiResponseType,
  CreateScoreRequest,
  GetScoresQuery,
  toQueryString,
  SCORE_ROUTES,
  SERVICE_URLS,
} from '@transcenders/contracts';
import { ApiClient } from '../api/ApiClient';
import { ApiCallOptions } from '../types/client.options';

export class ScoreApiService {
  /**
   * Internal method to call the score service
   */
  private static async callScoreService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.SCORE}${endpoint}`;
    return ApiClient.call(url, options);
  }
  
  /**
   * Gets a list of scores based on optional query parameters
   */
  static async getScores(query?: GetScoresQuery) {
    const queryString = query ? toQueryString(query) : '';
    return this.callScoreService(`${SCORE_ROUTES.SCORES}${queryString}`);
  }
  
  /**
   * Creates a new score
   */
  static async createScore(scoreData: CreateScoreRequest) {
    return this.callScoreService(SCORE_ROUTES.SCORES, {
    method: 'POST',
    body: scoreData,
    });
  }
  
  /**
   * Gets scores by user by their ID
   */
  static async getScoresById(id: number) {
    return this.callScoreService(SCORE_ROUTES.SCORES_BY_ID.replace(':id', id.toString()));
  }

}
