import { Type } from '@fastify/type-provider-typebox';

const UserSchema = Type.Object({
  id: Type.Number(),
  username: Type.String(),
  email: Type.String(),
  display_name: Type.String(),
  created_at: Type.String(),
  modified_at: Type.String(),
});

export const createUserSchema = {
  body: Type.Object({
    username: Type.String({ minLength: 3, maxLength: 20 }),
    email: Type.String({ format: 'email' }),
    display_name: Type.Optional(Type.String({ maxLength: 50 })),
  }),
};

export const updateUserSchema = {
  params: Type.Object({
    id: Type.String({ pattern: '^[0-9]+$' }),
  }),
  body: Type.Partial(
    Type.Object(
      {
        username: Type.String({ minLength: 3, maxLength: 20 }),
        email: Type.String({ format: 'email' }),
        display_name: Type.String({ maxLength: 50 }),
      },
      { additionalProperties: false },
    ),
  ),
};

export const checkExistsSchema = {
  params: Type.Object(
    {
      identifier: Type.String({ minLength: 3, maxLength: 50 }),
    },
    { additionalProperties: false },
  ),
};
