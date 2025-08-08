import { ApiClient } from '@transcenders/api-client';
import { getEnvVar } from '@transcenders/contracts';
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
  const [error, setError] = useState<string | null>(null);
  const hasHandledOAuth = useRef(false);

  useEffect(() => {
    async function handleGoogleAuthFromParams() {
      const sp = new URLSearchParams(window.location.search);
      const errorLocaleKey = sp.get('error');
      const code = sp.get('code');

      if (errorLocaleKey) {
        setError(t(errorLocaleKey ?? 'something_went_wrong'));
        navigate('/login', { replace: true });
        return;
      }

      // If code present, treat as Google login attempt
      if (code) {
        if (hasHandledOAuth.current) return;
        hasHandledOAuth.current = true;
        // Copy code once, then strip URL to avoid duplicate handling
        const codeOnce = code;
        navigate('/login', { replace: true });
        try {
          const tokens = await ApiClient.auth.googleLogin(codeOnce);
          await loginWithTokens(tokens);
          navigate('/', { replace: true });
        } catch (err: any) {
          setError(t(err?.localeKey ?? 'google_auth_failed'));
          navigate('/login', { replace: true });
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
      await login(username, password);
    } catch (err: any) {
      setError(t(err.localeKey) || t('something_went_wrong'));
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

        <div className="h-4">
          {error && <p className="text-[#786647] mt-2 text-xs sm:text-sm">{error}</p>}
        </div>

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
