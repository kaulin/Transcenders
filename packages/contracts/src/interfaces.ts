export interface DatabaseResult<T> {
  success: boolean;
  operation: string;
  context?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    isConstraintError: boolean;
  };
}
