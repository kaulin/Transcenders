export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    isConstraintError: boolean;
    operation: string;
  };
}
