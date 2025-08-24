import { ApiClient } from '@transcenders/api-client';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { getTokens } from '../utils/authTokens';

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { clearTokens, setTokens } = useAuth();
  const { setUser } = useUser();

  useEffect(() => {
    async function autoLogin() {
      const { accessToken, refreshToken } = getTokens();

      // First, try to validate existing access token
      if (accessToken) {
        try {
          const user = await ApiClient.auth.getCurrentUser();
          setUser(user);
          setReady(true);
          return;
        } catch {
          // Access token invalid/expired, fall through to refresh
        }
      }

      // Fall back to refresh token flow
      if (refreshToken) {
        try {
          const tokens = await ApiClient.auth.refreshToken(refreshToken);
          setTokens(tokens);
          const user = await ApiClient.auth.getCurrentUser();
          setUser(user);
        } catch {
          clearTokens();
        } finally {
          setReady(true);
        }
      } else {
        setReady(true);
      }
    }

    autoLogin();
  }, [clearTokens, setUser, setTokens]);

  if (!ready) return null;
  return <>{children}</>;
}
