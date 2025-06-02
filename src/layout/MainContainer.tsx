import { Routes, Route, Navigate } from 'react-router-dom'

import { useUser } from '../contexts/UserContext';

import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Tournament from '../pages/Tournament'
import LocalGame from '../pages/LocalGame'

const MainContainer = () => {
  const { user } = useUser()

  return (
    <div className="mt-24 h-[calc(100%-5rem)] overflow-y-auto px-10 pb-8">
      {user ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/localgame" element={<LocalGame />} />
            <Route path="/tournament" element={<Tournament />} />
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
