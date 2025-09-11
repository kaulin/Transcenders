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

  const lang = user?.lang;

  useEffect(() => {
    if (!lang) return;
    if (i18n.language === lang) return;

    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full h-[clamp(75px,9.8vh,128px)] px-[clamp(0.125rem,6vw,5rem)] z-50 flex items-center">
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
