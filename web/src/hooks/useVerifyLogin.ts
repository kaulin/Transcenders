import { ApiClient } from '@transcenders/api-client';
import { decodeToken, type LoginUser } from '@transcenders/contracts';
import { usePlayers } from '../hooks/usePlayers';
import { useApiClient } from './useApiClient';

const useVerifyLogin = () => {
  const { setPlayer } = usePlayers();
  const api = useApiClient();

  async function login(username: string, password: string, playerNumber: number) {
    const loginInfo: LoginUser = { username, password };
    const authData = await api(() => ApiClient.auth.login(loginInfo));
    const payload = decodeToken(authData.accessToken);

    const user = await api(() => ApiClient.user.getUserById(payload.userId));

    setPlayer(playerNumber, {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      ready: true,
    });
  }

  return { login };
};

export default useVerifyLogin;
