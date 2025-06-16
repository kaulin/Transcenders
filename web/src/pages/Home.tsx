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
	const [playerReady, setPlayerReady] = useState<{ [key:number]: boolean }>({})

	const handlePlayerReady = (playerNumber: number) => {
		setPlayerReady(prev => ({
			...prev,
			[playerNumber]: true,
		}))
	}

	const handlePlayerUnReady = (playerNumber: number) => {
		setPlayerReady(prev => ({
			...prev,
			[playerNumber]: false,
		}))
	}

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
			<div className="h-full flex flex-col basis-1/2 px-10 py-14 bg-[#605c4c13] items-center justify-center">
				{gameMode === 'match' && (
					<div className="w-full h-full max-w-sm flex flex-col">
						<div className="flex basis-1/4 flex-col"></div>
						<div className="flex basis-1/4 flex-col justify-end pb-8">
							<h2 className="profile-label">Player 1</h2>
							<p className="mb-6 border-b-2 border-white text-lg flex justify-between">{user?.username}</p>
						</div>
						<div className="flex basis-1/4 flex-col justify-start">
							<PlayerLoginForm playerNumber={2} onContinue={handlePlayerReady} onGoBack={handlePlayerUnReady} isReady={playerReady[2]} />
						</div>
						<div className="flex basis-1/4 items-center justify-center">
							{gameMode === "match" && playerReady[2] && (
								<Link to="/LocalGame" className="profile-button">start</Link>
							)}
						</div>
					</div>
				)}

				{gameMode === 'tournament' && (
					<div className="w-full h-full max-w-sm flex flex-col">
						<div className="flex basis-1/6"></div>
						<div className="flex basis-1/6 flex-col justify-center">
							<h2 className="profile-label">Player 1</h2>
							<p className="mb-6 border-b-2 border-white pb-1 text-lg">{user?.username}</p>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm playerNumber={2} onContinue={handlePlayerReady} onGoBack={handlePlayerUnReady} isReady={playerReady[2]}/>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm playerNumber={3} onContinue={handlePlayerReady} onGoBack={handlePlayerUnReady} isReady={playerReady[3]}/>
						</div>
						<div className="flex basis-1/6 flex-col justify-start">
							<PlayerLoginForm playerNumber={4} onContinue={handlePlayerReady} onGoBack={handlePlayerUnReady} isReady={playerReady[4]}/>
						</div>
						<div className="flex basis-1/6 items-center justify-center">
							{gameMode === "tournament" && playerReady[2] && playerReady[3] && playerReady[4] && (
								<Link to="/LocalGame" className="profile-button mt-0">start</Link>
							)}
						</div>
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