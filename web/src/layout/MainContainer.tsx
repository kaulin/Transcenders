import { Navigate, Route, Routes } from 'react-router-dom';

import { useUser } from '../hooks/useUser';

import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MatchPage from '../pages/MatchPage';
import Profile from '../pages/Profile';
import SignUp from '../pages/SignUp';
import TournamentPage from '../pages/TournamentPage';

const MainContainer = () => {
  const { user } = useUser();

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat blur-md" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="relative h-full z-10 px-[clamp(0.125rem,6vw,5rem)] pt-[clamp(0.125rem,2vh,0.75rem)] pb-[clamp(0.125rem,6vh,5rem)]">
        {user ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/matchpage" element={<MatchPage />} />
            <Route path="/tournamentpage" element={<TournamentPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default MainContainer;
