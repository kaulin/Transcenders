import { AuthData } from '@transcenders/contracts';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function saveTokens(tokens: AuthData) {
  sessionStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function saveAccessToken(accessToken: string) {
  sessionStorage.setItem(ACCESS_KEY, accessToken);
}

export function getTokens(): Partial<AuthData> {
  return {
    accessToken: sessionStorage.getItem(ACCESS_KEY) ?? undefined,
    refreshToken: localStorage.getItem(REFRESH_KEY) ?? undefined,
  };
}

export function clearAllTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
