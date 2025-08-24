import { ApiClient } from '@transcenders/api-client';
import { decodeToken, type AuthData, type LoginUser } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';
import { useAuth } from './useAuth';

const useAuthLogin = () => {
  const { setUser } = useUser();
  const { setTokens } = useAuth();

  async function login(username: string, password: string, code?: string) {
    const loginInfo: LoginUser = { username, password, code };
    const tokens = await ApiClient.auth.login(loginInfo);
    setTokens(tokens);
    const payload = decodeToken(tokens.accessToken);

    const user = await ApiClient.user.getUserById(payload.userId);
    setUser(user);
  }

  async function loginWithTokens(tokens: AuthData) {
    setTokens(tokens);
    const user = await ApiClient.auth.getCurrentUser();
    setUser(user);
  }

  return { login, loginWithTokens };
};

export default useAuthLogin;
