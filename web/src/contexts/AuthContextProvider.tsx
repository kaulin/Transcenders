import { ApiClient } from '@transcenders/api-client';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { clearAllTokens, getTokens, saveAccessToken } from '../utils/authTokens';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ accessToken }, setState] = useState(() => getTokens());

  useEffect(() => {
    ApiClient.setAuthToken(accessToken);
  }, [accessToken]);

  const setAccessToken = useCallback((token: string) => {
    saveAccessToken(token);
    setState((prev) => ({ ...prev, accessToken: token }));
    ApiClient.setAuthToken(token);
  }, []);

  const clearTokens = useCallback(() => {
    clearAllTokens();
    setState({ accessToken: undefined });
    ApiClient.setAuthToken();
  }, []);

  const value = useMemo(
    () => ({ accessToken, setAccessToken, clearTokens }),
    [accessToken, setAccessToken, clearTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
