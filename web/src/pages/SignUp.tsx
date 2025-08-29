import { ApiClient } from '@transcenders/api-client';
import { type RegisterUser } from '@transcenders/contracts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useAuthLogin from '../hooks/useAuthLogin';

const SignUp = () => {
  const { t } = useTranslation();
  const { login } = useAuthLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('pw_no_match'));
      return;
    }

    try {
      const registrationInfo: RegisterUser = { username, password };
      await ApiClient.auth.register(registrationInfo);
      await login(username, password);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  }

  return (
    <div className="relative w-full h-full flex justify-center items-center pb-28">
      <form onSubmit={handleSignUp} className="login-bubble bg-[#6e5d41]/5">
        <h1 className="text-2xl sm:text-3xl font-fascinate mb-3">{t('sign_up')}</h1>

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

        <input
          type="password"
          required
          value={confirmPassword}
          placeholder={t('repeat_pw')}
          className="login-input-field mt-2"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="h-4">{error && <p className="tsc-error-message">{error}</p>}</div>

        <button type="submit" className="mt-4">
          {t('sign_up')}
        </button>

        <p className="mt-6">{t('existing_user')}?</p>
        <p>
          <Link to="/" className="link-color underline underline-offset-2">
            {' '}
            {t('log_in')}{' '}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
