import { ApiClient } from '@transcenders/api-client';
import { ERROR_CODES, getEnvVar, ServiceError } from '@transcenders/contracts';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import useAuthLogin from '../hooks/useAuthLogin';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginWithTokens } = useAuthLogin();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [needsCode, setNeedsCode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasHandledOAuth = useRef(false);

  useEffect(() => {
    async function handleGoogleAuthFromParams() {
      const sp = new URLSearchParams(window.location.search);
      const errorLocaleKey = sp.get('error');
      const googleCode = sp.get('code');

      if (errorLocaleKey) {
        setError(t(errorLocaleKey ?? 'something_went_wrong'));
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // If code present, treat as Google login attempt
      if (googleCode) {
        if (hasHandledOAuth.current) return;
        hasHandledOAuth.current = true;
        // Copy code once, then strip URL to avoid duplicate handling
        const codeOnce = googleCode;
        window.history.replaceState({}, '', window.location.pathname);
        try {
          const tokens = await ApiClient.auth.googleLogin(codeOnce);
          await loginWithTokens(tokens);
          navigate('/', { replace: true });
        } catch (err: any) {
          setError(t(err?.localeKey ?? 'google_auth_failed'));
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }

    handleGoogleAuthFromParams();
  }, [navigate, t, loginWithTokens]);

  async function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    const authGoogleLoginURL = getEnvVar('AUTH_SERVICE_URL', '');
    window.location.href = `${authGoogleLoginURL}/auth/google/login`;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password, code);
    } catch (err: any) {
      if (err instanceof ServiceError) {
        if (err.codeOrError === ERROR_CODES.AUTH.TWO_FACTOR_CODE_SENT) {
          setNeedsCode(true);
          setError(t(err.localeKey ?? 'two_fac_login_required'));
          return;
        }
      }
      setError(t(err?.localeKey) || t('something_went_wrong'));
    }
  }

  return (
    <div className="relative w-full h-full flex justify-center items-center pb-28">
      <form onSubmit={handleLogin} className="login-bubble">
        <h1 className="text-2xl sm:text-3xl font-fascinate py-3">{t('log_in')}</h1>

        <input
          type="text"
          maxLength={20}
          required
          value={username}
          placeholder={t('username')}
          className="login-input-field mt-2"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          required
          value={password}
          placeholder={t('password')}
          className="login-input-field mt-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        {needsCode && (
          <input
            type="text"
            value={code}
            placeholder={t('code')}
            className="login-input-field mt-2"
            onChange={(e) => setCode(e.target.value)}
          />
        )}

        <div className="h-4">{error && <p className="tsc-error-message">{error}</p>}</div>

        <button type="submit" className="mt-4">
          {t('log_in')}
        </button>
        <button type="button" className="mt-4" onClick={handleGoogleLogin}>
          {'Google Sign-in'}
        </button>

        <p className="mt-6">
          {t('new_user')}?
          <Link to="/SignUp" className="link-color underline underline-offset-2">
            {' '}
            {t('sign_up')}{' '}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
