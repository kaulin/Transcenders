import { ApiClient } from '@transcenders/api-client';
import { ERROR_CODES, ServiceError, StepupMethod } from '@transcenders/contracts';
import { TokenValidator } from '@transcenders/server-utils';
import type {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from 'fastify';
import fp from 'fastify-plugin';

// The shape of the object we will decorate onto Fastify as "authenticate"
interface AuthenticateDecorators {
  // No authentication.
  none: () => preHandlerHookHandler;

  // Requires a valid access token.
  required: () => preHandlerHookHandler;

  // Requires a valid access token AND ownership of the given route param (default: "id").
  owner: (paramName: string) => preHandlerHookHandler;

  // Requires token + ownership + elevated (step-up) flag (default: "id").
  stepup: (paramName: string) => preHandlerHookHandler;

  // Meant for internal use only - requires bypass header, no fallback
  admin: () => preHandlerHookHandler;
}

// Module augmentation: add `user` and `authenticate` to Fastify
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
    authenticate: AuthenticateDecorators;
  }
}

// TODO change all error codes

const authenticatePlugin: FastifyPluginCallback = function (fastify, _opts, done) {
  // Helpers
  const hasBypass = (request: FastifyRequest): boolean => {
    const authBypass = request.headers['x-auth-bypass'] as string | undefined;
    if (authBypass) {
      const bypassUserId = parseInt(authBypass, 10);
      if (!isNaN(bypassUserId)) {
        request.user = {
          userId: bypassUserId,
          jti: 'mock-jti',
          stepup: true,
          stepupMethod: 'password',
        };
        return true;
      }
    }
    return false;
  };

  const requireBypassToken = async (request: FastifyRequest) => {
    if (!hasBypass(request)) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: 'Internal route access requires bypass token',
      });
    }
  };

  const authenticateToken = async (request: FastifyRequest) => {
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

    const requestedUserId = parseInt(requestedUserIdStr, 10);
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

  // Decorator implementation

  const authenticate: AuthenticateDecorators = {
    // No authentication required
    none: (): preHandlerHookHandler => {
      return async (request) => {
        //done
      };
    },

    // Requires valid token
    required: (): preHandlerHookHandler => {
      return async (request) => {
        if (hasBypass(request)) return;

        await authenticateToken(request);
        if (request.user) {
          ApiClient.admin.activityPing(request.user.userId);
        }
      };
    },

    // Requires token + ownership of paramName
    owner: (paramName = 'id'): preHandlerHookHandler => {
      return async (request, reply) => {
        if (hasBypass(request)) return;

        await authenticateToken(request);
        await checkOwnership(request, reply, paramName);
      };
    },

    // Requires token + ownership + step-up authentication
    stepup: (paramName = 'id'): preHandlerHookHandler => {
      return async (request, reply) => {
        if (hasBypass(request)) return;

        await authenticateToken(request);
        await checkOwnership(request, reply, paramName);
        await checkStepup(request, reply);
      };
    },

    // Meant for internal use only - requires bypass token
    admin: (): preHandlerHookHandler => {
      return async (request) => {
        await requireBypassToken(request);
      };
    },
  };

  fastify.decorate('authenticate', authenticate);
  done();
};

export async function registerAuthenticate(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authenticatePlugin);
}

export default fp(authenticatePlugin, {
  name: 'authenticate-plugin',
  fastify: '5.x',
});
