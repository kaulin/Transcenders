import {
  userRouteSchemas,
  standardApiResponses,
  USER_ROUTES,
  userByIdSchema,
} from '@transcenders/contracts';
import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

/**
 * SWAGGER
 * localhost:3001/docs
 */
export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    USER_ROUTES.USERS,
    {
      schema: userRouteSchemas.getUsers,
    },
    UserController.getUsers,
  );

  fastify.post(
    USER_ROUTES.USERS,
    {
      schema: userRouteSchemas.addUser,
    },
    UserController.addUser,
  );

  fastify.get(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.getUserById,
    },
    UserController.getUserById,
  );

  fastify.patch(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.updateUser,
    },
    UserController.updateUser,
  );

  fastify.delete(
    USER_ROUTES.USER_BY_ID,
    {
      schema: userRouteSchemas.deleteUser,
    },
    UserController.deleteUser,
  );

  fastify.get(
    USER_ROUTES.USER_EXISTS,
    {
      schema: userRouteSchemas.checkUserExists,
    },
    UserController.checkUserExists,
  );

  fastify.get(
    USER_ROUTES.USERS_EXACT,
    {
      schema: userRouteSchemas.getUserExact,
    },
    UserController.getUserExact,
  );
}
