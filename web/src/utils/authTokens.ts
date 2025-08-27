import { AuthData } from '@transcenders/contracts';

const ACCESS_KEY = 'accessToken';

export function saveAccessToken(accessToken: string) {
  sessionStorage.setItem(ACCESS_KEY, accessToken);
}

export function getTokens(): Partial<AuthData> {
  return {
    accessToken: sessionStorage.getItem(ACCESS_KEY) ?? undefined,
  };
}

export function clearAllTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
}
