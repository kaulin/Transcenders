import { ApiClient } from '@transcenders/api-client';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { usePlayers } from './usePlayers';
import { useUser } from './useUser';

/**
 * Simple hook that provides logout and full cleanup functionality
 * Usage:
 *  const logout = useLogout();
 *  await logout();
 *  await logout('session_expired');
 */
export function useLogout() {
  const { user, setUser } = useUser();
  const { resetAll } = usePlayers();
  const { clearTokens } = useAuth();
  const navigate = useNavigate();

  const getCookie = (key: string) => {
    const cookies = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
    return cookies ? cookies.pop() : '';
  };

  const logout = useCallback(
    async (localeKey?: string) => {
      try {
        if (user) {
          await ApiClient.auth.logout(user.id, getCookie('csrf'));
        }
      } catch {
        // cleanup local even on failure, so ignore errors
      } finally {
        clearTokens();
        resetAll();
        setUser(null);

        // Build login path with optional error parameter
        let loginPath = '/login';
        if (localeKey) {
          const params = new URLSearchParams();
          params.set('error', localeKey);
          loginPath = `/login?${params.toString()}`;
        }

        navigate(loginPath, { replace: true });
      }
    },
    [user, clearTokens, resetAll, setUser, navigate],
  );

  return logout;
}
