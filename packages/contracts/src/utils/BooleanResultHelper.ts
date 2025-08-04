import { BooleanOperationResult } from '../user.schemas.js';

// #TODO boolean results are a bit weird, maybe we throw ServiceError on failures instead, and get proper messages with localeKey
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
