export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string | object;
  headers?: Record<string, string>;
  timeout?: number;
}
