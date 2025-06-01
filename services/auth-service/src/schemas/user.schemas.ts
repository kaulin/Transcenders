import { Type } from '@fastify/type-provider-typebox';
import { TSchema } from '@sinclair/typebox';

const UserSchema = Type.Object({
  id: Type.Number(),
  username: Type.String(),
  email: Type.String(),
  display_name: Type.String(),
  created_at: Type.String(),
  modified_at: Type.String(),
});

// Success response wrapper
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

export const updateUserSchema = {
  params: Type.Object({
    id: Type.String({ pattern: '^[0-9]+$' }),
  }),
  body: Type.Partial(
    Type.Object({
      username: Type.String({ minLength: 3, maxLength: 20 }),
      email: Type.String({ format: 'email' }),
      display_name: Type.String({ maxLength: 50 }),
    }),
  ),
  response: {
    200: SuccessResponseSchema(UserSchema),
    404: ErrorResponseSchema,
    400: ErrorResponseSchema,
  },
};

export const getUsersSchema = {
  response: {
    200: SuccessResponseSchema(Type.Array(UserSchema)),
    500: ErrorResponseSchema,
  },
};
