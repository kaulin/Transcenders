import { ApiClient } from '@transcenders/api-client';
import type { UpdateUserRequest, User } from '@transcenders/contracts';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { UserContext } from './UserContext';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = useCallback(
    async (updates: UpdateUserRequest) => {
      if (!user) return null;
      const updated = await ApiClient.user.updateUser(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user],
  );

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>{children}</UserContext.Provider>
  );
}
