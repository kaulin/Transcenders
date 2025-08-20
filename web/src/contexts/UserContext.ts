import type { UpdateUserRequest, User } from '@transcenders/contracts';
import { createContext } from 'react';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (userData: UpdateUserRequest) => Promise<User | null>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
