import { ApiClient } from '@transcenders/api-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiClient } from '../hooks/useApiClient';
import { useAuth } from '../hooks/useAuth';

export default function ElevatePassword({ userId }: { userId: number }) {
  const { t } = useTranslation();
  const { setAccessToken } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  async function handleElevate() {
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await api(() => ApiClient.auth.stepupPassword(userId, password));
      setAccessToken(accessToken);
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm mb-2">{t('verify_password') ?? 'Verify with password'}</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field"
        placeholder={t('password') ?? 'Password'}
      />
      <button
        onClick={handleElevate}
        disabled={loading || !password}
        className="rounded-button bg-[#6e5d41]/15 mt-3"
      >
        {loading ? (t('verifying') ?? 'Verifying...') : (t('verify') ?? 'Verify')}
      </button>
      {error && <p className="tsc-error-message">{t(error)}</p>}
    </div>
  );
}
