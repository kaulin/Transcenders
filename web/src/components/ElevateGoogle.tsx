import { ApiClient } from '@transcenders/api-client';
import { useTranslation } from 'react-i18next';
import { useApiClient } from '../hooks/useApiClient';

export default function ElevateGoogle() {
  const { t } = useTranslation();
  const api = useApiClient();

  async function handleGoogle() {
    const googleLink = await api(() => ApiClient.auth.googleAuthStepup());
    window.location.href = googleLink.url;
  }

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm mb-2">{t('verify_google') ?? 'Verify with Google'}</label>
      <button onClick={handleGoogle} className="rounded-button bg-[#6e5d41]/15">
        {t('continue_with_google') ?? 'Continue_with_google'}
      </button>
    </div>
  );
}
