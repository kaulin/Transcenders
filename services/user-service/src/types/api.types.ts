export interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    service: string;
    timestamp: string;
  };
}
