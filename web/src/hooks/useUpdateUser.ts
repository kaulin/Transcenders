import { ApiClient } from '@transcenders/api-client';
import type { UpdateUserRequest } from '@transcenders/contracts';
import { useCallback } from 'react';
import { useApiClient } from './useApiClient';
import { useUser } from './useUser';

/**
 * Hook for updating user data with automatic token refresh
 * Usage:
 *  const updateUser = useUpdateUser();
 *  await updateUser({ username: 'newname' });
 */
export function useUpdateUser() {
  const { user, setUser } = useUser();
  const api = useApiClient();

  return useCallback(
    async (updates: UpdateUserRequest) => {
      if (!user) return null;

      const updated = await api(() => ApiClient.user.updateUser(user.id, updates));
      setUser(updated);
      return updated;
    },
    [user, setUser, api],
  );
}
