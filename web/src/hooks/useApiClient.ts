import { ApiClient } from '@transcenders/api-client';
import { ServiceError } from '@transcenders/contracts';
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useLogout } from './useLogout';

/**
 * Simple hook that provides automatic token refresh for API calls
 * Usage:
 *  const api = useApiClient();
 *  await api(() => ApiClient.user.updateUser(id, data));
 */
export function useApiClient() {
  const { refreshToken, setTokens } = useAuth();
  const logout = useLogout();

  const refreshTokens = useCallback(async (): Promise<void> => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await ApiClient.auth.refreshToken(refreshToken);
    setTokens(response);
  }, [refreshToken, setTokens]);

  // Wraps any API call with automatic refresh based on HTTP status codes
  const api = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T> => {
      try {
        // First attempt with current token
        return await apiCall();
      } catch (error) {
        if (!ServiceError.isServiceError(error)) {
          throw error;
        }

        switch (error.httpStatus) {
          case 410:
            // Security event, logout immediately (no retry)
            const errorKey = error.localeKey ?? 'auth_security_event_detected';
            logout(errorKey);
            break;
          case 401:
            try {
              // Token issue, try refresh once
              await refreshTokens();
              // Retry the original call with new token
              return await apiCall();
            } catch (refreshError) {
              // If refresh fails, logout user
              if (ServiceError.isServiceError(refreshError)) {
                logout(refreshError.localeKey ?? 'session_expired');
              } else {
                logout('session_expired');
              }
            }
        }
        // Rethrow any other ServiceError
        throw error;
      }
    },
    [refreshTokens, logout],
  );

  return api;
}
