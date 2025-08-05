import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@transcenders/contracts';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
