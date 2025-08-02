import { ApiClient } from '../packages/api-client/src/api/ApiClient';
import { AuthData } from '../packages/contracts/src/auth.schemas';
import { decodeToken } from '../packages/contracts/src/utils/decodeToken';

async function main() {
  const userCreated = await ApiClient.auth.register({
    username: 'allar',
    password: '12345',
  });

  if (!userCreated.success) {
    console.log('error', userCreated.error);
  }

  const myBrandNewToken = await ApiClient.auth.login({
    username: 'allar',
    password: '12345',
  });
  if (myBrandNewToken.success) {
    const authData = myBrandNewToken.data as AuthData;
    console.log(`got the token: ${authData.accessToken}`);
    console.log(`decoding token for user info...`);
    const userData = decodeToken(authData.accessToken);
    console.log(userData);

    const userDeleted = await ApiClient.user.deleteUser(userData.userId);
    if (userDeleted.success) {
      console.log(`${userData.userId} deleted successfully`);
    } else {
      console.log(`${userDeleted.error}`);
    }
  }
}
main();
