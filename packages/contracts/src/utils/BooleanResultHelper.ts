import { BooleanOperationResult } from '../user.schemas.js';
export class BooleanResultHelper {
  static success(message: string): BooleanOperationResult {
    return {
      success: true,
      message,
    };
  }

  static failure(message: string): BooleanOperationResult {
    return {
      success: false,
      message,
    };
  }
}
