import { ApiClient } from '../packages/api-client/src/api/ApiClient';
import { decodeToken } from '../packages/contracts/src/utils/decodeToken';

async function main() {
  try {
    const user = await ApiClient.auth.register({
      username: 'allar',
      password: '12345',
    });

    const tokens = await ApiClient.auth.login({
      username: 'allar',
      password: '12345',
    });
    console.log(`got the token: ${tokens.accessToken}`);
    console.log(`decoding token for user info...`);
    const userData = decodeToken(tokens.accessToken);
    console.log(userData);

    const userDeleted = await ApiClient.user.deleteUser(userData.userId);
    if (userDeleted.success) {
      console.log(`${userData.userId} deleted successfully`);
    }
  } catch (err) {
    console.log(String(err));
  }
}
main();
