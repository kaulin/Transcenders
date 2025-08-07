import { ApiClient } from '@transcenders/api-client';
import { GoogleFlows } from '@transcenders/contracts';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthLogin from '../hooks/useAuthLogin';
import { useUser } from '../hooks/useUser';

const Callback = () => {
  const hasRun = useRef(false);
  const { loginWithTokens } = useAuthLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();

  useEffect(() => {
    // ref guard to only run once
    if (hasRun.current) return;
    hasRun.current = true;

    const handleGoogleError = async (error?: string | null) => {
      if (!error) return;
      navigate(`/login?error=${error}`);
    };

    const handleGoogleLogin = async (code: string | null) => {
      try {
        if (!code) throw 42;
        const tokens = await ApiClient.auth.googleLogin(code);
        await loginWithTokens(tokens);
        navigate('/');
      } catch (error: any) {
        // Any error, redirect to login with error
        const localeKey = error.localeKey ?? 'google_auth_failed';
        handleGoogleError(localeKey);
      }
    };

    const type = searchParams.get('type') as GoogleFlows;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    if (error) handleGoogleError(error);

    switch (type) {
      case 'login':
        handleGoogleLogin(code);
        break;

      default:
        navigate(`/login?error=google_auth_failed`);
        break;
    }
  }, [loginWithTokens, navigate, searchParams]);

  // Show simple loading spinner while processing
  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div className="animate-ping rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
};

export default Callback;
