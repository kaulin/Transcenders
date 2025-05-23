import { Routes, Route, Navigate } from 'react-router-dom'

import { useUser } from "./contexts/UserContext"

import Header from './layout/Header'
import Footer from './layout/Footer'
import MainContainer from './layout/MainContainer'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Tournament from './pages/Tournament'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const App = () => {
  const { user } = useUser()

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="bg-bubble-8 left-2/4 top-10"></div>
      <div className="bg-bubble-8 left-10 -top-6"></div>
      <div className="bg-bubble-8 left-2/4 -bottom-28"></div>
      <div className="bg-bubble-8 -right-10 top-1/4"></div>
      <div className="bg-bubble-7 left-1/3 top-2/4"></div>
      <div className="bg-bubble-7 right-48 bottom-16"></div>
      <div className="bg-bubble-7 -left-16 top-1/3"></div>
      <div className="bg-bubble-7 left-16 -bottom-28"></div>
      <div className="bg-bubble-6 top-1/4 left-1/4"></div>
      <div className="bg-bubble-6 top-1/2 left-3/4"></div>
      <div className="bg-bubble-5 right-3/4 bottom-1/4"></div>
      <div className="bg-bubble-5 left-3/4 -top-4"></div>
      <div className="bg-bubble-3 right-1/2 top-8"></div>
      <div className="bg-bubble-3 right-1/4 top-1/4"></div>

      <main>
      <Header />
         {user ? (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournament" element={<Tournament />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </>
        ) : (
          <>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </>
        )}
      </main>
    </div>
  )
}

export default App

// 2560 1920 1280 640
