import { AuthData } from '@transcenders/contracts';
import { createContext } from 'react';

interface AuthContextType {
  accessToken?: string;
  refreshToken?: string;
  setTokens: (tokens: AuthData) => void;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
