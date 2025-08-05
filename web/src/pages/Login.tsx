import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import useAuthLogin from '../hooks/useAuthLogin';

const Login = () => {
  const { t } = useTranslation();
  const { login, loginWithTokens } = useAuthLogin();

  const [username, setUsername] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const tokensParam = searchParams.get('tokens');
    if (error) {
      setError('Google auth failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (tokensParam) {
      const tokens = JSON.parse(decodeURIComponent(tokensParam));
      loginWithTokens(tokens);
    }
  }, [searchParams, loginWithTokens]);

  async function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = 'http://localhost:3002/auth/google';
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
