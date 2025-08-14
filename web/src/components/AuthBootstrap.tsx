import { ApiClient } from '@transcenders/api-client';
import { decodeToken } from '@transcenders/contracts';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { getTokens } from '../utils/authTokens';

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { setAccessToken, clearTokens, setTokens } = useAuth();
  const { setUser } = useUser();

  useEffect(() => {
    async function autoLogin() {
      const { accessToken, refreshToken } = getTokens();
      if (accessToken) {
        try {
          setAccessToken(accessToken);
          const { userId } = decodeToken(accessToken);
          const user = await ApiClient.user.getUserById(userId);
          setUser(user);
          setReady(true);
          return;
        } catch {
          // fall through to refresh if available
        }
      }

      if (refreshToken) {
        try {
          const tokens = await ApiClient.auth.refreshToken(refreshToken);
          setTokens(tokens);
          const { userId } = decodeToken(tokens.accessToken);
          const user = await ApiClient.user.getUserById(userId);
          setUser(user);
          setReady(true);
          return;
        } catch {
          clearTokens();
        }
      }
      setReady(true);
    }

    autoLogin();
  }, [setAccessToken, clearTokens, setUser, setTokens]);

  if (!ready) return null;
  return <>{children}</>;
}
