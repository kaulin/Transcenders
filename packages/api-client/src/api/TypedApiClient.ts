import { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { ServiceError } from '@transcenders/contracts';
import { ApiCallOptions } from '../types/client.options.js';
import { ApiClient } from './ApiClient.js';

export abstract class TypedApiClient {
  /**
   * Makes a typed API call that validates the response data against a schema.
   */
  protected static async callTyped<T extends TSchema>(
    url: string,
    schema: T | null,
    options: ApiCallOptions = {},
  ): Promise<Static<T>> {
    const response = await ApiClient.call(url, options);

    if (!response.success) {
      throw ServiceError.fromApiResponse(response.error);
    }
    if (!schema) return null;

    // Validate and return typed data
    Value.Assert(schema, response.data);
    return response.data as Static<T>;
  }
}
