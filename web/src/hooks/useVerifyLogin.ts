import { ApiClient } from '@transcenders/api-client';
import { decodeToken, type AuthData, type LoginUser, type User } from '@transcenders/contracts';
import { usePlayers } from '../hooks/usePlayers';

const useVerifyLogin = () => {
  const { setPlayer } = usePlayers();

  async function login(username: string, password: string, playerNumber: number) {
    const loginInfo: LoginUser = { username, password };
    const authData = await ApiClient.auth.login(loginInfo);
    const payload = decodeToken(authData.accessToken);

    const user = await ApiClient.user.getUserById(payload.userId);

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
