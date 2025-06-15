import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

import PlayerLoginForm from "../components/PlayerLoginForm"

import curiousCat from "/images/curiousCat.avif"

const Home = () => {
    const { t } = useTranslation()
    const { user } = useUser()

	const [gameMode, setGameMode] = useState<"match" | "tournament" | null>(null)

    return (
		<div className="w-full h-full profile-box flex-row">
			<div className="h-full flex flex-col basis-1/2 p-10 items-center justify-center">
				<h1 className="text-6xl font-fascinate">{t('hello')} {user?.username}</h1>
				<p className="mb-10 text-xl">{t('welcome')}!</p>

				<div className="flex flex-col">
					<button
						onClick={() => setGameMode("match")}
						className="profile-button"
					>
						{t('start_match')}
					</button>

					<button
						onClick={() => setGameMode("tournament")}
						className="profile-button"
					>
						{t('start_tournament')}
					</button>
				</div>

			</div>
			<div className="h-full flex flex-col basis-1/2 p-10 bg-[#605c4c13] items-center justify-center">
				{gameMode === 'match' && (
					<div className="w-full max-w-sm flex flex-col">
						<h2 className="profile-label">Player 1</h2>
						<p className="mb-6 border-b-2 border-white pb-1 text-lg">{user?.username}</p>
						<PlayerLoginForm playerNumber={2} />

						<Link to="/LocalGame" className="profile-button">start</Link>
					</div>
				)}

				{gameMode === 'tournament' && (
					<div className="w-full max-w-sm overflow-y-auto">
						<h2 className="profile-label">Player 1</h2>
						<p className="mb-6 border-b-2 border-white pb-1 text-lg">{user?.username}</p>
						<PlayerLoginForm playerNumber={2} />
						<PlayerLoginForm playerNumber={3} />
						<PlayerLoginForm playerNumber={4} />

						<button className="profile-button">
							start
						</button>
					</div>
				)}
			</div>

			<img
				src={curiousCat}
				alt="curiousCat"
				className="absolute left-0 bottom-0 translate-y-[41%] w-72 sm:w-96 lg:w-[400px] object-contain pointer-events-none"
			/>
		</div>
	)
}

export default Home
