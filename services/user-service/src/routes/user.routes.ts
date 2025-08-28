import {
  checkExistsSchema,
  createUserSchema,
  getUserSchema,
  getUsersSchema,
  standardApiResponses,
  updateUserSchema,
  USER_ROUTES,
  userIdParamSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController.js';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export async function registerUserRoutes(app: FastifyInstance) {
  app.get(
    USER_ROUTES.USERS,
    {
      preHandler: app.authenticate.required(),
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
      preHandler: app.authenticate.internal(),
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
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Get specific user by ID',
        tags: ['User'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    UserController.getUserById,
  );

  app.patch(
    USER_ROUTES.USER_BY_ID,
    {
      preHandler: app.authenticate.owner('id'),
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
      preHandler: app.authenticate.stepup('id'),
      schema: {
        description: 'Delete user by ID',
        tags: ['User'],
        params: userIdParamSchema,
        response: standardApiResponses,
      },
    },
    UserController.deleteUser,
  );

  app.get(
    USER_ROUTES.USER_EXISTS,
    {
      preHandler: app.authenticate.required(),
      schema: {
        description: 'Check if username exists',
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
      preHandler: app.authenticate.required(),
      schema: {
        description: 'find user by name (query params: ?username=)',
        tags: ['User'],
        querystring: getUserSchema.querystring,
        response: standardApiResponses,
      },
    },
    UserController.getUserExact,
  );
}
