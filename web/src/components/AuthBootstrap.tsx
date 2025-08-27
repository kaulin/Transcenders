import { ApiClient } from '@transcenders/api-client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { getTokens } from '../utils/authTokens';

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { clearTokens, setTokens, setAccessToken } = useAuth();
  const { setUser } = useUser();
  const hasRunOnce = useRef(false);
  const api = useApiClient();

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRunOnce.current) return;
    hasRunOnce.current = true;

    async function autoLogin() {
      const { accessToken, refreshToken } = getTokens();

      // First, try to validate existing access token
      if (accessToken) {
        try {
          setAccessToken(accessToken);
          const user = await api(() => ApiClient.auth.getCurrentUser());
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
          const user = await api(() => ApiClient.auth.getCurrentUser());
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
  }, [clearTokens, setUser, setTokens, setAccessToken, api]);

  if (!ready) return null;
  return <>{children}</>;
}
