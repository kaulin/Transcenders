import { ApiClient } from '@transcenders/api-client';
import { ServiceError } from '@transcenders/contracts';
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useLogout } from './useLogout';

let refreshing = false;
let refreshPromise: Promise<void> | null = null;

function getCookie(name: string): string | null {
  const str = document.cookie;
  if (!str) return null;
  for (const part of str.split(';')) {
    const [rawKey, ...rawValParts] = part.trim().split('=');
    if (rawKey === name) {
      const rawVal = rawValParts.join('=');
      try {
        return decodeURIComponent(rawVal);
      } catch {
        return rawVal;
      }
    }
  }
  return null;
}

// handle multiple 401s at the same time
async function ensureRefreshedOnce(setAccessToken: (t: string) => void) {
  if (refreshing) return refreshPromise;
  refreshing = true;

  refreshPromise = (async () => {
    const csrf = getCookie('csrf') ?? '';
    const { accessToken } = await ApiClient.auth.refreshToken(csrf);
    setAccessToken(accessToken);
  })().finally(() => {
    refreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Simple hook that provides automatic token refresh for API calls
 * Usage:
 *  const api = useApiClient();
 *  await api(() => ApiClient.user.updateUser(id, data));
 */
export function useApiClient() {
  const { setAccessToken } = useAuth();
  const logout = useLogout();

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
          // Security event, logout immediately (no retry)
          case 410:
            const errorKey = error.localeKey ?? 'auth_security_event_detected';
            logout(errorKey);
            break;
          // On 401 - refresh once, then retry original call
          case 401:
            try {
              await ensureRefreshedOnce(setAccessToken);
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
    [setAccessToken, logout],
  );

  return api;
}
