import { getEnvVar } from '@transcenders/contracts';
import { useTranslation } from 'react-i18next';

export default function ElevateGoogle() {
  const { t } = useTranslation();

  function handleGoogle() {
    const authUrl = getEnvVar('AUTH_SERVICE_URL', '');
    window.location.href = `${authUrl}/auth/google/stepup`;
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
