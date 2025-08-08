import { ErrorCode, getErrorLocaleKey, GoogleFlows } from '@transcenders/contracts';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Callback = () => {
  const hasRun = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Ref guard to only run once
    if (hasRun.current) return;
    hasRun.current = true;

    const redirectWithReplace = (path: string) => {
      navigate(path, { replace: true });
    };

    const type = searchParams.get('type') as GoogleFlows;
    const code = searchParams.get('code');
    const error = searchParams.get('error') as ErrorCode;
    // All backend errors go back to login
    if (error) {
      const localeKey = getErrorLocaleKey(error);
      const search = new URLSearchParams({ error: localeKey }).toString();
      redirectWithReplace(`/login?${search}`);
      return;
    }

    // Must have a code to proceed
    if (!code) {
      redirectWithReplace(`/login?error=google_auth_failed`);
      return;
    }

    // Route by flow type
    switch (type) {
      case 'login': {
        const codeParams = new URLSearchParams({ code }).toString();
        redirectWithReplace(`/login?${codeParams}`);
        return;
      }
      case 'set-password': {
        const codeParams = new URLSearchParams({ code }).toString();
        redirectWithReplace(`/profile?${codeParams}`);
        return;
      }
      default:
        redirectWithReplace(`/login?error=google_auth_failed`);
        return;
    }
  }, [navigate, searchParams]);

  // Show simple loading spinner while processing
  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
};

export default Callback;
