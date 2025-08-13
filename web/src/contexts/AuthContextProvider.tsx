import { ApiClient } from '@transcenders/api-client';
import type { AuthData } from '@transcenders/contracts';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { clearAllTokens, getTokens, saveAccessToken, saveTokens } from '../utils/authTokens';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ accessToken, refreshToken }, setState] = useState(() => getTokens());

  useEffect(() => {
    ApiClient.setAuthToken(accessToken);
  }, [accessToken]);

  const setTokens = (tokens: AuthData) => {
    saveTokens(tokens);
    setState({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    ApiClient.setAuthToken(tokens.accessToken);
  };

  const setAccessToken = (token: string) => {
    saveAccessToken(token);
    setState((prev) => ({ ...prev, accessToken: token }));
    ApiClient.setAuthToken(token);
  };

  const clearTokens = () => {
    clearAllTokens();
    setState({ accessToken: undefined, refreshToken: undefined });
    ApiClient.setAuthToken();
  };

  const value = useMemo(
    () => ({ accessToken, refreshToken, setTokens, setAccessToken, clearTokens }),
    [accessToken, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
