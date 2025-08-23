import { ApiClient } from '@transcenders/api-client';
import { AUTH_ROUTES, getEnvVar } from '@transcenders/contracts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTokenElevation } from '../hooks/useTokenElevation';
import { useUser } from '../hooks/useUser';
import { useUserCreds } from '../hooks/useUserCreds';

type Step = 'idle' | 'email' | 'code';

export default function TwoFactorSection() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isElevated } = useTokenElevation();
  const [loading, setLoading] = useState(false);
  const {
    hasPassword,
    googleLinked,
    twoFacEnabled,
    loading: credsLoading,
    error: credsError,
    refetch: refetchCreds,
  } = useUserCreds(user?.id);

  const [step, setStep] = useState<Step>('idle');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { search } = useLocation();

  // handle 2fa google errors
  useEffect(() => {
    const sp = new URLSearchParams(search);
    const error = sp.get('error');
    if (error) {
      setError(error ?? 'google_auth_failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [search]);

  useEffect(() => {
    const onUserUpdated = () => {
      if (user?.updated_at) refetchCreds();
    };
    window.addEventListener('userCredsChanged', onUserUpdated);
    return () => window.removeEventListener('userCredsChanged', onUserUpdated);
  }, [user?.updated_at, refetchCreds]);

  const begin = () => {
    setError(null);
    setLoading(true);
    setEmail('');
    setCode('');
  };
  const end = () => setLoading(false);

  function onConnectGoogle() {
    if (!isElevated) return;
    setError(null);
    const authUrl = getEnvVar('AUTH_SERVICE_URL', '');
    const googleEnable = AUTH_ROUTES.GOOGLE_AUTH.replace(':flow', 'enable');
    window.location.href = `${authUrl}${googleEnable}`;
  }
  function onStartEmail2FA() {
    if (!isElevated) return;
    setError(null);
    setStep('email');
  }
  async function onDisable2FA() {
    if (!isElevated) return;
    if (!user) return;
    begin();
    try {
      await ApiClient.auth.twoFacRequestDisable(user.id);
      refetchCreds();
      setStep('code');
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      end();
    }
  }
  async function onSendCode() {
    if (!isElevated) return;
    if (!user) return;
    begin();
    try {
      await ApiClient.auth.twoFacRequestEnroll(user.id, email);
      refetchCreds();
      setStep('code');
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      end();
    }
  }
  async function onVerifyCode() {
    if (!isElevated) return;
    if (!user) return;
    begin();
    try {
      if (twoFacEnabled) {
        await ApiClient.auth.twoFacDisable(user.id, code);
      } else {
        await ApiClient.auth.twoFacEnable(user.id, code);
      }
      refetchCreds();
      setStep('idle');
    } catch (err: any) {
      setError(err?.localeKey ?? 'something_went_wrong');
    } finally {
      end();
    }
  }
  function onCancel() {
    setError(null);
    setStep('idle');
    setEmail('');
    setCode('');
  }
  function onBackToEmail() {
    setError(null);
    setStep('email');
    setCode('');
  }

  const disabled = !isElevated || credsLoading || loading || !hasPassword;

  return (
    <div className="w-full max-w-sm flex flex-col gap-2">
      {/* Google + Email 2FA buttons */}
      {!hasPassword && <p className="tsc-info-message">{t('set_password_before_disable')}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConnectGoogle}
          disabled={disabled || googleLinked}
          className="rounded-button inline-flex items-center text-sm px-4 py-2"
        >
          {/* Simple Google icon (inline) */}
          <svg
            className="w-4 h-4 mr-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 19"
          >
            <path
              fillRule="evenodd"
              d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
              clipRule="evenodd"
            />
          </svg>
          {t('google') ?? 'Google'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-6 ${googleLinked ? 'fill-green-700' : 'fill-red-700'} ml-2`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={!twoFacEnabled ? onStartEmail2FA : onDisable2FA}
          disabled={disabled}
          className="rounded-button inline-flex items-center text-sm px-4 py-2"
        >
          {twoFacEnabled ? (t('disable_2fa') ?? 'Disable 2FA') : (t('enable_2fa') ?? 'Enable 2FA')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-6 ${twoFacEnabled ? 'fill-green-700' : 'fill-red-700'} ml-2`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
      </div>

      <div className="h-14">
        {/* Step: email entry */}
        {step === 'email' && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email') ?? 'Email'}
              className="input-field"
              disabled={disabled}
              />
            <div className="flex gap-4">
              <button type="button" onClick={onCancel} className="text-sm">
                {t('cancel') ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={onSendCode}
                disabled={disabled || email.length === 0}
                className="text-sm disabled:text-white/60"
                >
                {loading ? (t('sending') ?? 'Sending...') : (t('send_code') ?? 'Send code')}
              </button>
            </div>
          </div>
        )}

        {/* Step: code entry */}
        {step === 'code' && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('verification_code') ?? 'Verification code'}
              className="input-field"
              disabled={disabled}
              />
            <div className="flex gap-4">
              {!twoFacEnabled && (
                <button type="button" onClick={onBackToEmail} className="text-sm pr-4">
                  {t('edit_email') ?? 'Edit email'}
                </button>
              )}
              <button type="button" onClick={onCancel} className="text-sm">
                {t('cancel') ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={onVerifyCode}
                disabled={disabled || code.length === 0}
                className="text-sm disabled:text-white/60"
                >
                {loading ? (t('verifying') ?? 'Verifying...') : (t('verify') ?? 'Verify')}
              </button>
            </div>
          </div>
        )}
        {credsError && <p className="tsc-error-message">{t(credsError)}</p>}
        {error && <p className="tsc-error-message text-sm">{t(error)}</p>}
      </div>
    </div>
  );
}
