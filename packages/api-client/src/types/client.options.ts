import { TSchema } from '@sinclair/typebox';

export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string | object;
  headers?: Record<string, string>;
  timeout?: number;
  expectedDataSchema?: TSchema;
}
