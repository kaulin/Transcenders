import { ApiClient } from '@transcenders/api-client';
import { decodeToken } from '@transcenders/contracts';
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
      const { refreshToken } = getTokens();

      if (refreshToken) {
        try {
          const tokens = await ApiClient.auth.refreshToken(refreshToken);
          const { userId } = decodeToken(tokens.accessToken);
          const user = await ApiClient.user.getUserById(userId);
          setUser(user);
          setTokens(tokens);
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
