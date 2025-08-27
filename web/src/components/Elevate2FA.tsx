import { ApiClient } from '@transcenders/api-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiClient } from '../hooks/useApiClient';
import { useAuth } from '../hooks/useAuth';

export default function Elevate2FA({ userId }: { userId: number }) {
  const { t } = useTranslation();
  const { setAccessToken } = useAuth();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  async function requestCode() {
    setError(null);
    setLoading(true);
    try {
      await api(() => ApiClient.auth.twoFacRequestStepup(userId));
      setCodeSent(true);
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await api(() => ApiClient.auth.stepup2fa(userId, code));
      setAccessToken(accessToken);
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm mb-2">{t('verify_2fa') ?? 'Verify with 2FA code'}</label>
      {!codeSent ? (
        <button onClick={requestCode} disabled={loading} className="rounded-button bg-[#6e5d41]/15">
          {loading ? (t('sending') ?? 'Sending...') : (t('send_code') ?? 'Send code')}
        </button>
      ) : (
        <>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
            placeholder={t('code') ?? 'Code'}
          />
          <button
            onClick={verifyCode}
            disabled={loading || !code}
            className="rounded-button bg-[#6e5d41]/15 mt-3"
          >
            {loading ? (t('verifying') ?? 'Verifying...') : (t('verify') ?? 'Verify')}
          </button>
        </>
      )}
      {error && <p className="tsc-error-message">{t(error)}</p>}
    </div>
  );
}
