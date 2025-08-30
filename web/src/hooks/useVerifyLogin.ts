import { ApiClient } from '@transcenders/api-client';
import { type LoginUser } from '@transcenders/contracts';
import { usePlayers } from '../hooks/usePlayers';
import { useApiClient } from './useApiClient';

const useVerifyLogin = () => {
  const { setPlayer } = usePlayers();
  const api = useApiClient();

  async function login(username: string, password: string, playerNumber: number) {
    // by setting onlyVerify to true, we only check for password to be correct and set no cookies or anything
    const verifyLoginInfo: LoginUser = { username, password, onlyVerify: true };
    const authData = await api(() => ApiClient.auth.login(verifyLoginInfo));

    const user = await api(() => ApiClient.user.getUserById(authData.userId));

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
