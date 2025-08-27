import { ApiClient } from '@transcenders/api-client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { clearTokens } = useAuth();
  const { setUser } = useUser();
  const hasRunOnce = useRef(false);
  const api = useApiClient();

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRunOnce.current) return;
    hasRunOnce.current = true;

    async function autoLogin() {
      try {
        // try with current AT
        const user = await api(() => ApiClient.auth.getCurrentUser());
        setUser(user);
        setReady(true);
        return;
      } catch {
        clearTokens();
      } finally {
        setReady(true);
      }
    }

    autoLogin();
  }, [clearTokens, setUser, api]);

  if (!ready) return null;
  return <>{children}</>;
}
