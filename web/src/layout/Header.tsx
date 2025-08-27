import { Cat, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useUser } from '../hooks/useUser';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../components/LanguageSwitch';
import { useLogout } from '../hooks/useLogout';

const Header = () => {
  const { user } = useUser();
  const { i18n, t } = useTranslation();
  const logout = useLogout();

  useEffect(() => {
    i18n.changeLanguage(user?.lang);
  }, [user, i18n]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-32 py-6 px-4 sm:px-24 flex">
      {user ? (
        <>
          <div className="flex basis-1/2 justify-start items-center text-center gap-4 sm:gap-10">
            <LanguageSwitch />
            <div className="flex justify-center items-center gap-4 uppercase">
              <div className="w-[36px] flex justify-center">
                <Link to="/home" className="relative group">
                  <Home className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                  <span className="absolute hidden button-label bottom-full left-2/3">
                    {t('home')}
                  </span>
                </Link>
              </div>
              <div className="w-[36px] flex justify-center">
                <Link to="/dashboard" className="relative group">
                  <LayoutDashboard className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                  <span className="absolute hidden button-label bottom-full left-2/3">
                    {t('dashboard')}
                  </span>
                </Link>
              </div>
              <div className="w-[36px] flex justify-center">
                <Link to="/profile" className="relative group">
                  <Cat className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                  <span className="absolute hidden button-label bottom-full left-2/3">
                    {t('profile')}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex basis-1/2 justify-end items-center">
            <button onClick={handleLogout} className="relative group">
              <LogOut className="h-6 w-6" />
              <span className="absolute hidden button-label bottom-full left-2/3">
                {t('log_out')}
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-end">
          <LanguageSwitch />
        </div>
      )}
    </header>
  );
};

export default Header;
