import { Routes, Route, Navigate } from 'react-router-dom'

import { useUser } from '../contexts/UserContext';

import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import MatchPage from '../pages/MatchPage'
import TournamentPage from '../pages/TournamentPage'

const MainContainer = () => {
  const { user } = useUser()

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">

      <div className="absolute inset-0 -z-10 bg-[url('/images/bg-orange.svg')] bg-cover bg-center bg-no-repeat scale-105 blur-md" />
      <div className="absolute inset-0 -z-10 bg-black/5" />

      <div className="relative h-full z-10 p-24 pt-32">
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
}

export default MainContainer
