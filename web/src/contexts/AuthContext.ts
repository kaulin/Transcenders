import { createContext } from 'react';

interface AuthContextType {
  accessToken?: string;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
