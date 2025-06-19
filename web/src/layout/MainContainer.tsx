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
    <div className="mt-24 h-[calc(100%-5rem)] overflow-y-auto px-10 pb-8 pt-2">
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
  );
}

export default MainContainer
