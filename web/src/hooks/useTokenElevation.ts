import { decodeToken, JWTPayload, StepupMethod } from '@transcenders/contracts';
import { useMemo } from 'react';
import { useAuth } from './useAuth';

type StepupStatus =
  | {
      isElevated: false;
    }
  | {
      isElevated: true;
      method: StepupMethod;
      userId: number;
    };

export function useTokenElevation(): StepupStatus {
  const { accessToken } = useAuth();

  return useMemo(() => {
    if (!accessToken) {
      return { isElevated: false };
    }
    try {
      const payload: JWTPayload = decodeToken(accessToken);
      if (!payload.stepup || !payload.stepup_method) {
        return { isElevated: false };
      }
      return {
        isElevated: payload.stepup,
        method: payload.stepup_method,
        userId: payload.userId,
      };
    } catch {
      return { isElevated: false };
    }
  }, [accessToken]);
}
