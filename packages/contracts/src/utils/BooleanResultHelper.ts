import { BooleanOperationResult } from '@transcenders/contracts';

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
