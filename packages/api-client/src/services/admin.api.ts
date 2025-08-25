import { Static, TSchema } from '@sinclair/typebox';
import { ADMIN_ROUTES, BooleanOperationResultSchema, SERVICE_URLS } from '@transcenders/contracts';
import { TypedApiClient } from '../api/TypedApiClient.js';
import { ApiCallOptions } from '../types/client.options.js';

export class AdminApiClient extends TypedApiClient {
  /**
   * Internal method to call some admin routes
   */
  private static async callAdminRoute<T extends TSchema>(
    endpoint: string,
    schema: T,
    options: ApiCallOptions = {},
  ): Promise<Static<T>> {
    const url = `${endpoint}`;
    return this.callTyped(url, schema, options);
  }

  /**
   * Gets a list of scores based on optional query parameters
   */
  static async activityPing(userId: number) {
    const endpoint = `${SERVICE_URLS.USER}${ADMIN_ROUTES.ACTIVITY.replace(':id', userId.toString())}`;
    const options: ApiCallOptions = { method: 'POST' };
    return this.callAdminRoute(endpoint, BooleanOperationResultSchema, options);
  }
}
