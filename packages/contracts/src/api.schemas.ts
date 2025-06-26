import { Static, Type } from '@sinclair/typebox';

/**
 * RESPONSE SCHEMAS
 */
export const ApiResponse = Type.Intersect(
  [
    Type.Union([
      Type.Object({
        success: Type.Literal(true),
        operation: Type.String(),
        data: Type.Unknown(),
      }),
      Type.Object({
        success: Type.Literal(false),
        operation: Type.String(),
        error: Type.String(),
      }),
    ]),
  ],
  { $id: 'ApiResponse' },
);
export type ApiResponseType = Static<typeof ApiResponse>;

export const standardApiResponses = {
  200: { $ref: 'ApiResponse#' },
  400: { $ref: 'ApiResponse#' },
  404: { $ref: 'ApiResponse#' },
  409: { $ref: 'ApiResponse#' },
  500: { $ref: 'ApiResponse#' },
} as const;
