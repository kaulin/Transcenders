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
  owner: (paramName: string | string[]) => preHandlerHookHandler;

  // Requires token + ownership + elevated (step-up) flag (default: "id").
  stepup: (paramName: string | string[]) => preHandlerHookHandler;

  // Meant for internal use only - requires bypass header, no fallback, no activity ping
  internal: () => preHandlerHookHandler;

  // Admin access - requires bypass or valid token
  admin: () => preHandlerHookHandler;
}

interface FastifyRequestUser {
  userId: number;
  jti: string;
  stepup: boolean;
  stepupMethod?: StepupMethod;
}

// Module augmentation: add `user` and `authenticate` to Fastify
declare module 'fastify' {
  interface FastifyRequest {
    user?: FastifyRequestUser;
  }

  interface FastifyInstance {
    authenticate: AuthenticateDecorators;
  }
}

const authenticatePlugin: FastifyPluginCallback = function (fastify, _opts, done) {
  // Helpers
  const hasBypass = (request: FastifyRequest, mockId?: number): boolean => {
    const authBypass = request.headers['x-auth-bypass'] as string | undefined;
    if (authBypass) {
      const bypassUserId = mockId ?? parseInt(authBypass, 10);
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
      throw new ServiceError(ERROR_CODES.COMMON.AUTH_BYPASS_REQUIRED, {
        reason: 'route access requires admin bypass',
      });
    }
  };

  const authenticateToken = async (request: FastifyRequest) => {
    // Check for bypass first
    if (hasBypass(request)) return;

    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      throw new ServiceError(ERROR_CODES.COMMON.AUTH_TOKEN_REQUIRED, {
        reason: 'Authorization token required',
      });
    }

    try {
      const payload = TokenValidator.verifyAccessToken(token);
      const user: FastifyRequestUser = {
        userId: payload.userId,
        jti: payload.jti,
        stepup: payload.stepup ?? false,
        stepupMethod: payload.stepup_method,
      };
      request.user = user;
    } catch (error) {
      throw new ServiceError(ERROR_CODES.COMMON.AUTH_TOKEN_INVALID, {
        reason: 'Invalid or expired token',
        originalError: error,
      });
    }
  };

  const checkOwnership = async (
    request: FastifyRequest,
    _reply: FastifyReply,
    paramName?: string | string[],
  ) => {
    if (!request.user || !paramName) {
      throw new ServiceError(ERROR_CODES.COMMON.UNAUTHORIZED_ACCESS, {
        reason: 'Authentication required',
      });
    }

    // If bypass is enabled, allow access
    if (hasBypass(request, request.user.userId)) {
      return;
    }

    const params = request.params as Record<string, string>;
    const paramNames = Array.isArray(paramName) ? paramName : [paramName];

    // Check if user owns ANY of the specified parameters
    for (const param of paramNames) {
      const requestedUserIdStr = params[param];
      if (requestedUserIdStr) {
        const requestedUserId = parseInt(requestedUserIdStr, 10);
        if (!isNaN(requestedUserId) && requestedUserId === request.user.userId) {
          return;
        }
      }
    }

    // No ownership found - check if any parameters existed
    const existingParams = paramNames.filter((param) => params[param]);
    if (existingParams.length === 0) {
      throw new ServiceError(ERROR_CODES.COMMON.AUTH_MISSING_PARAMETER, {
        reason: `Missing required parameter(s): ${paramNames.join(', ')}`,
      });
    }

    // Parameters exist but user doesn't own any of them
    throw new ServiceError(ERROR_CODES.COMMON.AUTH_OWNERSHIP_REQUIRED, {
      reason: 'You can only access your own resources',
    });
  };

  const checkStepup = async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user?.stepup) {
      throw new ServiceError(ERROR_CODES.COMMON.AUTH_STEPUP_REQUIRED, {
        reason: 'Elevated authentication required',
      });
    }
  };

  const pingActivity = async (request: FastifyRequest) => {
    if (request.user) {
      await ApiClient.admin.activityPing(request.user.userId);
    }
  };

  // Decorator implementation
  const authenticate: AuthenticateDecorators = {
    // No authentication required
    none: (): preHandlerHookHandler => {
      return async () => {
        // No authentication needed
      };
    },

    // Requires valid token
    required: (): preHandlerHookHandler => {
      return async (request) => {
        await authenticateToken(request);
        await pingActivity(request);
      };
    },

    // Requires token + ownership of paramName
    owner: (paramName: string | string[] = 'id'): preHandlerHookHandler => {
      return async (request, reply) => {
        await authenticateToken(request);
        await checkOwnership(request, reply, paramName);
        await pingActivity(request);
      };
    },

    // Requires token + ownership + step-up authentication
    stepup: (paramName: string | string[] = 'id'): preHandlerHookHandler => {
      return async (request, reply) => {
        await authenticateToken(request);
        await checkOwnership(request, reply, paramName);
        await checkStepup(request, reply);
        await pingActivity(request);
      };
    },

    // Meant for internal use only - requires bypass token, NO activity ping
    internal: (): preHandlerHookHandler => {
      return async (request) => {
        await requireBypassToken(request);
      };
    },

    // Admin access - requires bypass or valid token
    admin: (): preHandlerHookHandler => {
      return async (request) => {
        await requireBypassToken(request);
        await pingActivity(request);
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
