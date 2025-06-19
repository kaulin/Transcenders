import { DatabaseTestResponse } from './database.types';

export interface HealthResponse {
  success: boolean;
  status: string;
  service: string;
  timestamp: string;
}

export interface TestResponse {
  success: boolean;
  data: DatabaseTestResponse;
}
