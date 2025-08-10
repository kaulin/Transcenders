import { ErrorCode, getErrorLocaleKey, GoogleFlows } from '@transcenders/contracts';
import { Navigate, useLocation } from 'react-router-dom';

const Callback = () => {
  const { search } = useLocation();

  const destination = () => {
    const sp = new URLSearchParams(search);
    const type = sp.get('type') as GoogleFlows;
    const code = sp.get('code');
    const error = sp.get('error') as ErrorCode;

    if (error) {
      const localeKey = getErrorLocaleKey(error);
      const qs = new URLSearchParams({ error: localeKey }).toString();
      return `/login?${qs}`;
    }

    if (!code) return `/login?error=google_auth_failed`;

    switch (type) {
      case 'login':
        return `/login?${new URLSearchParams({ code }).toString()}`;
      case 'set-password':
        return `/profile?${new URLSearchParams({ code }).toString()}`;
      default:
        return `/login?error=google_auth_failed`;
    }
  };

  return <Navigate to={destination()} replace />;
};

export default Callback;
