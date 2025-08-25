import { ApiClient } from '@transcenders/api-client';
import { ErrorCode, getErrorLocaleKey, GoogleFlows } from '@transcenders/contracts';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export default function Callback() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user, setUser } = useUser();
  const handledOAuthOnce = useRef(false);

  useEffect(() => {
    if (handledOAuthOnce.current) return;
    handledOAuthOnce.current = true;

    const go = (to: string) => {
      navigate(to, { replace: true });
    };

    (async () => {
      const sp = new URLSearchParams(search);
      const type = sp.get('type') as GoogleFlows | null;
      const code = sp.get('code');
      const error = sp.get('error') as ErrorCode | null;

      if (error) {
        const localeKey = getErrorLocaleKey(error);
        go(`/login?${new URLSearchParams({ error: localeKey }).toString()}`);
        return;
      }

      if (!code) {
        go(`/login?error=google_auth_failed`);
        return;
      }

      if (type === 'login') {
        go(`/login?${new URLSearchParams({ code }).toString()}`);
        return;
      }

      if (type === 'stepup') {
        go(`/profile?${new URLSearchParams({ code }).toString()}`);
        return;
      }

      if (type === 'connect') {
        try {
          if (!user) throw '';
          const userId = user.id;
          await ApiClient.auth.googleConnect(userId, code);
          go('/profile');
        } catch {
          go(`/profile?error=google_auth_failed`);
        }
        return;
      }
      go(`/login?error=google_auth_failed`);
    })();
  }, [search, navigate, user]);

  // Optional: small placeholder while we redirect
  return null;
}
