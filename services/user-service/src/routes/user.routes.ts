import {
  checkExistsSchema,
  createUserSchema,
  getUserSchema,
  getUsersSchema,
  standardApiResponses,
  updateUserSchema,
  USER_ROUTES,
  userByIdSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export async function registerUserRoutes(app: FastifyInstance) {
  app.get(
    USER_ROUTES.USERS,
    {
      schema: {
        description: 'List users (with optional query params: ?search=, ?limit=, ?offset=)',
        tags: ['User'],
        querystring: getUsersSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUsers,
  );

  app.post(
    USER_ROUTES.USERS,
    {
      schema: {
        description: 'Create new user',
        tags: ['Internal ONLY'],
        body: createUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.addUser,
  );

  app.get(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Get specific user by ID',
        tags: ['User'],
        params: userByIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.getUserById,
  );

  app.patch(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Update user by ID',
        tags: ['User'],
        params: updateUserSchema.params,
        body: updateUserSchema.body,
        response: standardApiResponses,
      },
    },
    UserController.updateUser,
  );

  app.delete(
    USER_ROUTES.USER_BY_ID,
    {
      schema: {
        description: 'Delete user by ID',
        tags: ['User'],
        params: userByIdSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.deleteUser,
  );

  app.get(
    USER_ROUTES.USER_EXISTS,
    {
      schema: {
        description: 'Check if username/email exists',
        tags: ['User'],
        params: checkExistsSchema.params,
        response: standardApiResponses,
      },
    },
    UserController.checkUserExists,
  );

  app.get(
    USER_ROUTES.USERS_EXACT,
    {
      schema: {
        description: 'find user by name or email (query params: ?username=, ?email=)',
        tags: ['User'],
        querystring: getUserSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUserExact,
  );
}
