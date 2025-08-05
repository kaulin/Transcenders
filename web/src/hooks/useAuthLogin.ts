import { ApiClient } from '@transcenders/api-client';
import { decodeToken, type AuthData, type LoginUser } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

const useAuthLogin = () => {
  const { setUser } = useUser();

  async function login(username: string, password: string) {
    const loginInfo: LoginUser = { username, password };
    const authData = await ApiClient.auth.login(loginInfo);
    const payload = decodeToken(authData.accessToken);

    const user = await ApiClient.user.getUserById(payload.userId);
    setUser(user);
  }

  async function loginWithTokens(tokens: AuthData) {
    const { refreshToken } = tokens;
    const { userId } = decodeToken(refreshToken);
    const user = await ApiClient.user.getUserById(userId);
    console.log('logging in with tokens I think?');
    setUser(user);
  }

  return { login, loginWithTokens };
};

export default useAuthLogin;
