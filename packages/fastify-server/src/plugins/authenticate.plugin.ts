import { ERROR_CODES, ServiceError, StepupMethod } from '@transcenders/contracts';
import { TokenValidator } from '@transcenders/server-utils';
import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: number;
      jti: string;
      stepup: boolean;
      stepupMethod?: StepupMethod;
    };
  }

  interface FastifyInstance {
    authenticate: {
      none: () => (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => void;
      required: () => (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => Promise<void>;
      owner: (
        paramName: string,
      ) => (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => Promise<void>;
      stepup: (
        paramName: string,
      ) => (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => Promise<void>;
    };
  }
}

const authenticatePlugin: FastifyPluginCallback = function (fastify, _opts, done) {
  // Helper functions
  const authenticateToken = async (request: FastifyRequest, _reply: FastifyReply) => {
    // Check for auth bypass header
    const authBypass = request.headers['x-auth-bypass'] as string | undefined;
    if (authBypass) {
      const bypassUserId = parseInt(authBypass);
      if (!isNaN(bypassUserId)) {
        console.log(`[AUTH BYPASS] Using mock user ID: ${bypassUserId}`);
        request.user = {
          userId: bypassUserId,
          jti: 'mock-jti',
          stepup: true,
          stepupMethod: 'password',
        };
        return;
      }
    }

    // Regular token validation
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      throw new ServiceError(ERROR_CODES.AUTH.INVALID_CREDENTIALS, {
        reason: 'Authorization token required',
      });
    }

    const payload = TokenValidator.verifyAccessToken(token);
    request.user = {
      userId: payload.userId,
      jti: payload.jti,
      stepup: payload.stepup ?? false,
      stepupMethod: payload.stepup_method,
    };
  };
  // TODO change all error codes
  const checkOwnership = async (
    request: FastifyRequest,
    _reply: FastifyReply,
    paramName?: string,
  ) => {
    if (!request.user || !paramName) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: 'Authentication required',
      });
    }

    const params = request.params as Record<string, string>;
    const requestedUserIdStr = params[paramName];
    if (!requestedUserIdStr) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: `Missing required parameter: ${paramName}`,
      });
    }

    const requestedUserId = parseInt(requestedUserIdStr);
    if (isNaN(requestedUserId) || requestedUserId !== request.user.userId) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: 'You can only access your own resources',
      });
    }
  };

  const checkStepup = async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user?.stepup) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: 'Elevated authentication required',
      });
    }
  };

  fastify.decorate('authenticate', {
    // No authentication required
    none: () => {
      return (_request: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) => {
        done();
      };
    },

    // Requires valid token
    required: () => {
      return async (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => {
        await authenticateToken(request, reply);
        done();
      };
    },

    // Requires token + ownership of paramName
    owner: (paramName = 'id') => {
      return async (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => {
        await authenticateToken(request, reply);
        await checkOwnership(request, reply, paramName);
        done();
      };
    },

    // Requires token + stepup authentication
    stepup: (paramName = 'id') => {
      return async (
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction,
      ) => {
        await authenticateToken(request, reply);
        await checkOwnership(request, reply, paramName);
        await checkStepup(request, reply);
        done();
      };
    },
  });

  done();
};

export async function registerAuthenticate(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authenticatePlugin);
}

export default fp(authenticatePlugin, {
  name: 'authenticate-plugin',
  fastify: '5.x',
});
