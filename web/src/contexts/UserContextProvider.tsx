import type { User } from '@transcenders/contracts';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { UserContext } from './UserContext';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
