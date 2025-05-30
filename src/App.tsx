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
import LocalGame from './pages/LocalGame'

import Background from './components/Background'

const bubbles = [
  { id: 1, colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
  { id: 1, colStart: 4, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble-4" },
  { id: 1, colStart: 6, rowStart: 1, colSpan: 3, rowSpan: 3, className: "bg-bubble-6" },
  { id: 1, colStart: 3, rowStart: 3, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
]

const App = () => {
  const { user } = useUser()

  return (
    <div className="relative h-screen overflow-hidden">
		<Background bubbles={bubbles} />
		<div className="col-start-10 row-start-1 col-span-2 row-span-2 bg-red-500" />

		<main>
			<Header />
			{user ? (
			<>
				<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/localgame" element={<LocalGame />} />
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
