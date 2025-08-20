import { ApiClient } from '@transcenders/api-client';
import { ServiceError } from '@transcenders/contracts';
import { useCallback, useEffect, useState } from 'react';

export function useUserCreds(userId?: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [twoFacEnabled, setTwoFacEnabled] = useState(false);

  const fetchInfo = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const info = await ApiClient.auth.getUserCredsInfo(id);
      setHasPassword(info.hasPassword);
      setGoogleLinked(info.googleLinked);
      setTwoFacEnabled(info.twoFacEnabled);
    } catch (err: unknown) {
      setError(
        err instanceof ServiceError && err.localeKey ? err.localeKey : 'something_went_wrong',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) void fetchInfo(userId);
  }, [userId, fetchInfo]);

  const refetch = useCallback(() => {
    if (!userId) return;
    void fetchInfo(userId);
  }, [userId, fetchInfo]);

  return {
    hasPassword,
    googleLinked,
    twoFacEnabled,
    loading,
    error,
    refetch,
  };
}
