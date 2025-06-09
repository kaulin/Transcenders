import { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { ApiResponse, ApiResponseType } from './user.schemas.js';

export class ApiClient {
  private static errorResponse(error: string): ApiResponseType {
    const result: ApiResponseType = {
      success: false,
      operation: 'api-call',
      error,
    };
    return result;
  }

  static async call(url: string, expectedDataSchema?: TSchema): Promise<ApiResponseType> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return this.errorResponse(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!Value.Check(ApiResponse, data)) {
        return this.errorResponse('Invalid response format from service');
      }

      // If successful response, optionally validate the data field
      if (data.success && expectedDataSchema) {
        if (!Value.Check(expectedDataSchema, data.data)) {
          return this.errorResponse('Response data does not match expected schema');
        }
      }
      return data;
    } catch (error) {
      return this.errorResponse(error instanceof Error ? error.message : 'Network error');
    }
  }

  /**
   * Helper method specifically for user service calls
   * Makes it easy to call user service without hardcoding URLs everywhere
   * more similar ones later, for other services.
   */
  static async callUserService(
    endpoint: string,
    expectedDataSchema?: TSchema,
  ): Promise<ApiResponseType> {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
    return this.call(`${userServiceUrl}${endpoint}`, expectedDataSchema);
  }
}
