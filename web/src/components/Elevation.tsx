import { ApiClient } from '@transcenders/api-client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTokenElevation } from '../hooks/useTokenElevation';
import { useUser } from '../hooks/useUser';
import { useUserCreds } from '../hooks/useUserCreds';
import TwoFAElevation from './Elevate2FA';
import GoogleElevation from './ElevateGoogle';
import PasswordElevation from './ElevatePassword';

export default function ElevationSection() {
  const { t } = useTranslation();
  const { setAccessToken } = useAuth();
  const { user } = useUser();
  const isElevated = useTokenElevation();
  const userId = user?.id;
  const { hasPassword, googleLinked, twoFacEnabled, loading, error } = useUserCreds(user?.id);
  const { search } = useLocation();
  const handledOAuthOnce = useRef(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle Google step-up callback (?code=...) on /profile
  useEffect(() => {
    if (handledOAuthOnce.current) return;
    handledOAuthOnce.current = true;

    const sp = new URLSearchParams(search);
    const code = sp.get('code');
    if (!code || !userId) return;

    window.history.replaceState({}, '', window.location.pathname);
    (async () => {
      try {
        const { accessToken } = await ApiClient.auth.stepupGoogle(userId, code);
        setAccessToken(accessToken);
      } catch (err: any) {
        setLocalError(err?.localeKey ?? 'google_auth_failed');
      }
    })();
  }, [search, userId, setAccessToken]);

  if (!userId || isElevated.isElevated) return null;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <h2 className="text-xl font-fascinate mb-2">
        {t('verify_identity') ?? 'Verify your identity'}
      </h2>
      <p className="text-sm mb-4 text-white/80 text-center">
        {t('profile_requires_elevation') ??
          'To edit sensitive settings, verify using one of the methods below.'}
      </p>

      {loading && <p className="text-sm">{t('loading') ?? 'Loading...'}</p>}
      {error && <p className="tsc-error-message">{t(error)}</p>}
      {localError && <p className="tsc-error-message">{t(localError)}</p>}

      <div className="flex flex-col gap-6">
        {hasPassword && !twoFacEnabled && <PasswordElevation userId={userId} />}
        {twoFacEnabled && <TwoFAElevation userId={userId} />}
        {googleLinked && <GoogleElevation />}
      </div>
    </div>
  );
}
