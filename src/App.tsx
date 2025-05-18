import { Routes, Route, Navigate } from 'react-router-dom'

import { useUser } from "./contexts/UserContext"

import Header from './layout/Header'
import Footer from './layout/Footer'
import MainContainer from './layout/MainContainer'

import SignIn from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Tournament from './pages/Tournament'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const App = () => {
  const { user } = useUser()

  return (
    <div className="relative h-screen overflow-hidden">
      <Header />
      <main className="h-full">
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
              <Route path="/" element={<SignIn />} />
              <Route path="/SignUp" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </>
        )}
      </main>
    </div>
  )
}

export default App
