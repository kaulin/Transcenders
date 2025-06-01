import { Type } from '@fastify/type-provider-typebox';

const UserSchema = Type.Object({
  id: Type.Number(),
  username: Type.String(),
  email: Type.String(),
  display_name: Type.String(),
  created_at: Type.String(),
  modified_at: Type.String(),
});

// Success response wrapper
import { TSchema } from '@sinclair/typebox';

const SuccessResponseSchema = (data: TSchema) =>
  Type.Object({
    success: Type.Literal(true),
    data: data,
    message: Type.Optional(Type.String()),
    timestamp: Type.Optional(Type.String()),
  });

// Error response schema
const ErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.String(),
  message: Type.Optional(Type.String()),
  timestamp: Type.Optional(Type.String()),
  code: Type.Optional(Type.String()),
});

export const createUserSchema = {
  body: Type.Object({
    username: Type.String({ minLength: 3, maxLength: 20 }),
    email: Type.String({ format: 'email' }),
    display_name: Type.Optional(Type.String({ maxLength: 50 })),
  }),
  response: {
    201: SuccessResponseSchema(UserSchema),
    500: ErrorResponseSchema,
  },
};

export const getUsersSchema = {
  response: {
    200: SuccessResponseSchema(Type.Array(UserSchema)),
    500: ErrorResponseSchema,
  },
};
