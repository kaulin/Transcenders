import { Cat, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useUser } from '../hooks/useUser';
import { usePlayers } from '../hooks/usePlayers';

import LanguageSwitch from '../components/LanguageSwitch';

const Header = () => {
  const { user, setUser } = useUser();
  const { resetAll } = usePlayers();

  const handleLogout = () => {
    resetAll();
    setUser(null);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-32 py-6 px-24 flex">
      {user ? (
        <>
          <div className="flex basis-1/2 justify-start items-center text-center gap-4 sm:gap-10">
            <LanguageSwitch />
            <div className="flex justify-center items-center gap-4 uppercase">
              <div className="w-[36px] flex justify-center">
                <Link to="/home">
                  <Home className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                </Link>
              </div>
              <div className="w-[36px] flex justify-center">
                <Link to="/dashboard">
                  <LayoutDashboard className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                </Link>
              </div>
              <div className="w-[36px] flex justify-center">
                <Link to="/profile">
                  <Cat className="link-color h-6 w-6 hover:h-9 hover:w-9" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex basis-1/2 justify-end items-center">
            <button onClick={handleLogout}>
              <LogOut className="h-6 w-6" />
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
