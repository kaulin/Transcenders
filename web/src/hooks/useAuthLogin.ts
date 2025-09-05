import { ApiClient } from '@transcenders/api-client';
import { type AuthData, type LoginUser } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';
import { useApiClient } from './useApiClient';
import { useAuth } from './useAuth';

const useAuthLogin = () => {
  const { setUser } = useUser();
  const { setAccessToken } = useAuth();
  const api = useApiClient();

  async function login(username: string, password: string, code?: string) {
    const loginInfo: LoginUser = { username, password, code };
    const tokens = await api(() => ApiClient.auth.login(loginInfo));
    setAccessToken(tokens.accessToken);

    const user = await api(() => ApiClient.user.getUserById(tokens.userId));
    setUser(user);
  }

  async function loginWithTokens(tokens: AuthData) {
    setAccessToken(tokens.accessToken);
    const user = await api(() => ApiClient.auth.getCurrentUser());
    setUser(user);
  }

  return { login, loginWithTokens };
};

export default useAuthLogin;
